package repository

import (
	"context"
	"fmt"
	"os"

	storage_go "github.com/supabase-community/storage-go"
	"github.com/supabase-community/supabase-go"
	"github.com/tkit/fruits-drill/tools/internal/config"
)

type SupabaseRepository struct {
	client     *supabase.Client
	bucketName string
}

func NewSupabaseRepository(cfg *config.Config) *SupabaseRepository {
	// NewClient returns (*Client, error). We panic on error here for simplicity in this cli tool,
	// or we could return error.
	client, err := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseServiceRoleKey, nil)
	if err != nil {
		// As this is a constructor for the CLI usage, panicking or logging fatal is often acceptable if config is wrong.
		// Detailed error handling would require changing signature.
		panic(fmt.Sprintf("failed to initialize supabase client: %v", err))
	}
	return &SupabaseRepository{
		client:     client,
		bucketName: cfg.SupabaseBucketName,
	}
}

// UploadFile uploads a file to Supabase Storage and returns the public URL.
func (r *SupabaseRepository) UploadFile(ctx context.Context, localPath, destPath string) (string, error) {
	f, err := os.Open(localPath)
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()

	// Upload
	// storage-go direct method: UploadFile(bucket, path, reader, options...)
	_, err = r.client.Storage.UploadFile(r.bucketName, destPath, f, storage_go.FileOptions{
		Upsert: &[]bool{true}[0], // Upsert expects bool? No, FileOptions.Upsert is usually *bool or bool. Checking struct def in debug... assume bool based on previous usage attempt, but might be bool directly if v0.8.x.
		// v0.7.0 was bool?, v0.8.1?
		// Verification: debug_storage output said storage_go.FileOptions.
		// I will try setting Upsert: &trueVal.
		ContentType: &[]string{"application/pdf"}[0],
	})

	// Wait, storage-go v0.7+ FileOptions fields are pointers often?
	// Let's verify fields if we can, or just guess safe.
	// Safe guess: Don't set options if unsure, BUT we want Upsert.
	// I'll try without options first? No, user wants overwrite.
	// Let's try passing options with helpers.

	if err != nil {
		return "", fmt.Errorf("failed to upload to supabase storage: %w", err)
	}

	// Get Public URL
	// GetPublicUrl(bucket, path)
	publicURL := r.client.Storage.GetPublicUrl(r.bucketName, destPath)
	return publicURL.SignedURL, nil
}

// GetPublicURL returns the public URL for a given storage path without uploading.
func (r *SupabaseRepository) GetPublicURL(destPath string) string {
	return r.client.Storage.GetPublicUrl(r.bucketName, destPath).SignedURL
}

// Drill represents the drills table structure
type Drill struct {
	ID           string `json:"id,omitempty"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	PDFURL       string `json:"pdf_url"`
	ThumbnailURL string `json:"thumbnail_url"`
}

// Tag represents the tags table structure
type Tag struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name"`
}

// DrillTag represents the join table
type DrillTag struct {
	DrillID string `json:"drill_id"`
	TagID   string `json:"tag_id"`
}

func (r *SupabaseRepository) RegisterDrill(ctx context.Context, title, desc, pdfURL, thumbURL string, tags []string) (string, error) {
	// 1. Insert Drill
	drill := Drill{
		Title:        title,
		Description:  desc,
		PDFURL:       pdfURL,
		ThumbnailURL: thumbURL,
	}

	var drillResult []Drill
	_, err := r.client.From("drills").Insert(drill, false, "", "", "").ExecuteTo(&drillResult)
	if err != nil {
		return "", fmt.Errorf("failed to insert drill: %w", err)
	}
	if len(drillResult) == 0 {
		return "", fmt.Errorf("no drill id returned")
	}
	drillID := drillResult[0].ID

	// 2. Process Tags
	if err := r.SyncTags(ctx, drillID, tags); err != nil {
		return "", fmt.Errorf("failed to sync tags: %w", err)
	}

	return drillID, nil
}

// GetDrillByPDFURL checks if a drill with the given PDF URL exists.
// We search for the URL containing the object key since the domain might vary or be partial.
// Actually, strict matching is safer if we know how we construct it.
// The existing Register logic stores the result of UploadFile.
// In UploadFile it returns `r.client.Storage.GetPublicUrl`.
// So we should be able to reconstruct the URL or search by suffix.
func (r *SupabaseRepository) GetDrillByPDFURL(ctx context.Context, pdfURL string) (*Drill, error) {
	var drills []Drill
	// Exact match check
	_, err := r.client.From("drills").Select("*", "", false).Eq("pdf_url", pdfURL).ExecuteTo(&drills)
	if err != nil {
		return nil, fmt.Errorf("failed to query drill by pdf_url: %w", err)
	}
	if len(drills) == 0 {
		return nil, nil
	}
	return &drills[0], nil
}

// SyncTags updates the tags for a drill.
// It ensures the drill has exactly the provided tags.
func (r *SupabaseRepository) SyncTags(ctx context.Context, drillID string, tags []string) error {
	// For simplicity, we can just ensure they exist and link them.
	// If we want to replace, we should remove existing links first?
	// The requirement is "update tags".
	// Let's first delete existing links for this drill
	// Note: deeper sync (diff) is more efficient but delete-all-insert is simpler for "Replace" semantics.
	// However, Supabase/Postgrest delete might require some care.
	// Using Delete() with Filter DrillID
	_, _, err := r.client.From("drill_tags").Delete("", "").Eq("drill_id", drillID).Execute()
	if err != nil {
		return fmt.Errorf("failed to clear existing tags: %w", err)
	}

	for _, tagName := range tags {
		if tagName == "" {
			continue
		}

		// Check if tag exists or Upsert
		tagPayload := Tag{Name: tagName}
		var tagResult []Tag

		// Upsert tag
		_, err := r.client.From("tags").Upsert(tagPayload, "name", "", "").ExecuteTo(&tagResult)
		if err != nil {
			return fmt.Errorf("failed to upsert tag %s: %w", tagName, err)
		}

		var tagID string
		if len(tagResult) > 0 {
			tagID = tagResult[0].ID
		} else {
			// Fallback: Select
			var findTags []Tag
			_, err := r.client.From("tags").Select("*", "", false).Eq("name", tagName).ExecuteTo(&findTags)
			if err != nil || len(findTags) == 0 {
				return fmt.Errorf("failed to retrieve tag id for %s: %w", tagName, err)
			}
			tagID = findTags[0].ID
		}

		// Link Drill and Tag
		link := DrillTag{
			DrillID: drillID,
			TagID:   tagID,
		}
		var linkResult []interface{}
		_, err = r.client.From("drill_tags").Insert(link, false, "", "", "").ExecuteTo(&linkResult)
		if err != nil {
			return fmt.Errorf("failed to link tag %s: %w", tagName, err)
		}
	}
	return nil
}

// GetDrillByTitle returns a drill by its title
func (r *SupabaseRepository) GetDrillByTitle(ctx context.Context, title string) (*Drill, error) {
	var drills []Drill
	_, err := r.client.From("drills").Select("*", "", false).Eq("title", title).ExecuteTo(&drills)
	if err != nil {
		return nil, fmt.Errorf("failed to query drill by title: %w", err)
	}
	if len(drills) == 0 {
		return nil, nil
	}
	return &drills[0], nil
}

// GetDrillTags returns the tags for a given drill ID
func (r *SupabaseRepository) GetDrillTags(ctx context.Context, drillID string) ([]Tag, error) {
	// Join drill_tags and tags
	// SELECT tags.* FROM drill_tags JOIN tags ON drill_tags.tag_id = tags.id WHERE drill_id = ?
	// Postgrest: select(tag_id, tags(*))
	
	type DrillTagWithTag struct {
		TagID string `json:"tag_id"`
		Tag   Tag    `json:"tags"`
	}

	var results []DrillTagWithTag
	_, err := r.client.From("drill_tags").Select("tag_id, tags(*)", "", false).Eq("drill_id", drillID).ExecuteTo(&results)
	if err != nil {
		return nil, fmt.Errorf("failed to get drill tags: %w", err)
	}

	tags := make([]Tag, len(results))
	for i, r := range results {
		tags[i] = r.Tag
	}
	return tags, nil
}

// DeleteDrill deletes a drill record.
func (r *SupabaseRepository) DeleteDrill(ctx context.Context, drillID string) error {
	// First delete relations in drill_tags? 
	// If CASCADE is not set up in DB, we must delete manually.
	// But `Delete` on `drills` will fail if there are foreign keys without cascade.
	// We will attempt to delete drill_tags first just in case.
	_, _, err := r.client.From("drill_tags").Delete("", "").Eq("drill_id", drillID).Execute()
	if err != nil {
		return fmt.Errorf("failed to delete drill_tags: %w", err)
	}

	_, _, err = r.client.From("drills").Delete("", "").Eq("id", drillID).Execute()
	if err != nil {
		return fmt.Errorf("failed to delete drill: %w", err)
	}
	return nil
}

// DeleteFile deletes a file from Supabase Storage
func (r *SupabaseRepository) DeleteFile(ctx context.Context, path string) error {
	// RemoveFile(bucket, []string{path})
	_, err := r.client.Storage.RemoveFile(r.bucketName, []string{path})
	if err != nil {
		return fmt.Errorf("failed to delete file %s: %w", path, err)
	}
	return nil
}

// CountDrillsForTag counts how many drills are using a specific tag
func (r *SupabaseRepository) CountDrillsForTag(ctx context.Context, tagID string) (int64, error) {
	_, count, err := r.client.From("drill_tags").Select("*", "exact", true).Eq("tag_id", tagID).Execute()
	if err != nil {
		return 0, fmt.Errorf("failed to count usage for tag %s: %w", tagID, err)
	}
	return count, nil
}

// DeleteTag deletes a tag by ID
func (r *SupabaseRepository) DeleteTag(ctx context.Context, tagID string) error {
	_, _, err := r.client.From("tags").Delete("", "").Eq("id", tagID).Execute()
	if err != nil {
		return fmt.Errorf("failed to delete tag %s: %w", tagID, err)
	}
	return nil
}
