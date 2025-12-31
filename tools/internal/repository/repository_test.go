package repository_test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/joho/godotenv"
	"github.com/tkit/fruits-drill/tools/internal/config"
	"github.com/tkit/fruits-drill/tools/internal/repository"
)

// setupRepo initializes the repository from environment variables.
// It skips the test if credentials are not found.
func setupRepo(t *testing.T) *repository.SupabaseRepository {
	_ = godotenv.Load("../../.env")

	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if url == "" || key == "" {
		t.Skip("Skipping integration test: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
	}

	cfg := &config.Config{
		SupabaseURL:            url,
		SupabaseServiceRoleKey: key,
		SupabaseBucketName:     "drills", // Use default or env
	}
	if b := os.Getenv("SUPABASE_BUCKET_NAME"); b != "" {
		cfg.SupabaseBucketName = b
	}

	// Capture output? config constructor might panic if invalid, but we checked.
	// Actually NewSupabaseRepository panics on error.
	return repository.NewSupabaseRepository(cfg)
}

func TestDeleteFlow(t *testing.T) {
	repo := setupRepo(t)
	ctx := context.Background()

	// 1. Setup Data
	// Create a dummy drill with a unique title
	uniqueID := time.Now().UnixNano()
	title := fmt.Sprintf("test_delete_%d", uniqueID)
	tagName := fmt.Sprintf("tag_%d", uniqueID)

	// We need valid URLs for non-failing inserts, but they can be dummy for DB test
	pdfURL := "https://example.com/dummy.pdf"
	thumbURL := "https://example.com/dummy.png"

	t.Logf("Registering drill: %s", title)
	id, err := repo.RegisterDrill(ctx, title, "Test Description", pdfURL, thumbURL, []string{tagName})
	if err != nil {
		t.Fatalf("Failed to register drill: %v", err)
	}
	t.Logf("Registered drill ID: %s", id)

	// 2. Verify creation
	d, err := repo.GetDrillByTitle(ctx, title)
	if err != nil {
		t.Fatalf("Failed to get drill: %v", err)
	}
	if d == nil {
		t.Fatal("Drill should exist")
	}
	if d.ID != id {
		t.Errorf("ID mismatch: got %s, want %s", d.ID, id)
	}

	// Verify Tag
	// GetDrillTags
	tags, err := repo.GetDrillTags(ctx, id)
	if err != nil {
		t.Fatalf("Failed to get tags: %v", err)
	}
	if len(tags) != 1 || tags[0].Name != tagName {
		t.Errorf("Tags mismatch: got %v, want [%s]", tags, tagName)
	}
	tagID := tags[0].ID

	// 3. Count Tags (Should be 1)
	count, err := repo.CountDrillsForTag(ctx, tagID)
	if err != nil {
		t.Fatalf("Failed to count tags: %v", err)
	}
	if count != 1 {
		t.Errorf("Tag usage count mismatch: got %d, want 1", count)
	}

	// 4. Delete Drill
	t.Log("Deleting drill...")
	err = repo.DeleteDrill(ctx, id)
	if err != nil {
		t.Fatalf("Failed to delete drill: %v", err)
	}

	// 5. Verify Drill Gone
	d2, err := repo.GetDrillByTitle(ctx, title)
	if err != nil {
		t.Fatalf("Failed to check drill existence: %v", err)
	}
	if d2 != nil {
		t.Fatal("Drill should be gone")
	}

	// 6. Verify Tag usage is 0 (Orphan check logic in CLI relies on this count before delete, 
	//    but after delete, the link is gone, so count should be 0)
	count2, err := repo.CountDrillsForTag(ctx, tagID)
	if err != nil {
		t.Fatalf("Failed to count tags after delete: %v", err)
	}
	if count2 != 0 {
		t.Errorf("Tag usage count should be 0 after drill delete, got %d", count2)
	}

	// 7. Delete Tag (Cleanup)
	t.Log("Deleting orphan tag...")
	err = repo.DeleteTag(ctx, tagID)
	if err != nil {
		t.Fatalf("Failed to delete tag: %v", err)
	}

	// Verify Tag Gone (Optional, but good)
	// We don't have GetTagByID exposed directly but we can try to delete again or something?
	// or assume success.
}
