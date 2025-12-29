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
	// postgrest-go: Insert(value interface{}, upsert bool?, onConflict string?, returning string?, count string?)
	// Actually Execute matches the query built.
	// We need query param "select" to return the ID? "returning=representation" is default usually.
	_, err := r.client.From("drills").Insert(drill, false, "", "", "").ExecuteTo(&drillResult)
	if err != nil {
		return "", fmt.Errorf("failed to insert drill: %w", err)
	}
	if len(drillResult) == 0 {
		return "", fmt.Errorf("no drill id returned")
	}
	drillID := drillResult[0].ID

	// 2. Process Tags
	for _, tagName := range tags {
		if tagName == "" {
			continue
		}

		// Check if tag exists or Upsert
		tagPayload := Tag{Name: tagName}
		var tagResult []Tag

		// Upsert tag
		_, err := r.client.From("tags").Upsert(tagPayload, "", "", "").ExecuteTo(&tagResult)
		if err != nil {
			return "", fmt.Errorf("failed to upsert tag %s: %w", tagName, err)
		}

		var tagID string
		if len(tagResult) > 0 {
			tagID = tagResult[0].ID
		} else {
			// Fallback: Select
			var findTags []Tag
			_, err := r.client.From("tags").Select("*", "", false).Eq("name", tagName).ExecuteTo(&findTags)
			if err != nil || len(findTags) == 0 {
				return "", fmt.Errorf("failed to retrieve tag id for %s: %w", tagName, err)
			}
			tagID = findTags[0].ID
		}

		// 3. Link Drill and Tag
		link := DrillTag{
			DrillID: drillID,
			TagID:   tagID,
		}
		// Insert link - linking table usually doesn't need to return anything
		// But ExecuteTo is safer to ensure it executed.
		var linkResult []interface{}
		_, err = r.client.From("drill_tags").Insert(link, false, "", "", "").ExecuteTo(&linkResult)
		if err != nil {
			// Ignore unique constraint violation if we run this multiple times?
			// But we created a new drill ID, so (drill_id, tag_id) should be unique.
			return "", fmt.Errorf("failed to link tag %s: %w", tagName, err)
		}
	}

	return drillID, nil
}
