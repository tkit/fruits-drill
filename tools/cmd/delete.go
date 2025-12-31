package cmd

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/config"
	"github.com/tkit/fruits-drill/tools/internal/repository"
)

var forceDelete bool

var deleteCmd = &cobra.Command{
	Use:   "delete [title]",
	Short: "Delete a drill by title",
	Long:  `Deletes a drill, its associated files (PDF, Thumbnail) from Storage, and cleans up unused tags.`,
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		title := args[0]
		ctx := context.Background()

		// 1. Load Config
		cfg, err := config.Load()
		if err != nil {
			log.Fatalf("Failed to load config: %v", err)
		}

		// 2. Initialize Repo
		repo := repository.NewSupabaseRepository(cfg)

		// 3. Get Drill
		drill, err := repo.GetDrillByTitle(ctx, title)
		if err != nil {
			log.Fatalf("Failed to get drill: %v", err)
		}
		if drill == nil {
			log.Fatalf("Drill not found with title: %s", title)
		}

		// 4. Get Tags
		tags, err := repo.GetDrillTags(ctx, drill.ID)
		if err != nil {
			log.Fatalf("Failed to get tags: %v", err)
		}

		// 5. Prepare Resources to Delete
		pdfPath, err := extractPathFromURL(drill.PDFURL, cfg.SupabaseURL, cfg.SupabaseBucketName)
		if err != nil {
			log.Printf("[WARNING] Could not parse PDF URL: %s. Will proceed without deleting file, or manual check needed.", drill.PDFURL)
		}
		thumbPath, err := extractPathFromURL(drill.ThumbnailURL, cfg.SupabaseURL, cfg.SupabaseBucketName)
		if err != nil {
			log.Printf("[WARNING] Could not parse Thumbnail URL: %s. Will proceed without deleting file.", drill.ThumbnailURL)
		}

		// Identify Orphan Tags
		var orphanTags []repository.Tag
		var keptTags []repository.Tag
		for _, t := range tags {
			count, err := repo.CountDrillsForTag(ctx, t.ID)
			if err != nil {
				log.Printf("Failed to count usage for tag %s: %v", t.Name, err)
				keptTags = append(keptTags, t) 
				continue
			}
			// If count is 1, it's only used by this drill (which we are deleting)
			if count == 1 {
				orphanTags = append(orphanTags, t)
			} else {
				keptTags = append(keptTags, t)
			}
		}

		// 6. Confirmation
		if !forceDelete {
			fmt.Println("The following resources will be DELETED:")
			fmt.Printf("  Drill: [%s] %s\n", drill.ID, drill.Title)
			if pdfPath != "" {
				fmt.Printf("  File: %s\n", pdfPath)
			}
			if thumbPath != "" {
				fmt.Printf("  File: %s\n", thumbPath)
			}
			if len(orphanTags) > 0 {
				fmt.Println("  Tags (Orphaned):")
				for _, t := range orphanTags {
					fmt.Printf("    - %s\n", t.Name)
				}
			}
			if len(keptTags) > 0 {
				fmt.Println("  Tags (Keeping):")
				for _, t := range keptTags {
					fmt.Printf("    - %s\n", t.Name)
				}
			}

			fmt.Print("\nAre you sure you want to delete these resources? [y/N]: ")
			reader := bufio.NewReader(os.Stdin)
			input, _ := reader.ReadString('\n')
			input = strings.TrimSpace(strings.ToLower(input))
			if input != "y" {
				fmt.Println("Operation cancelled.")
				return
			}
		}

		// 7. Execute Delete
		// Delete relationship is handled by DeleteDrill if DB cascade logic or simple delete order.
		
		// Delete Drill
		log.Println("Deleting Drill record...")
		if err := repo.DeleteDrill(ctx, drill.ID); err != nil {
			log.Fatalf("Failed to delete drill: %v", err)
		}

		// Delete Files
		if pdfPath != "" {
			log.Printf("Deleting PDF: %s...", pdfPath)
			if err := repo.DeleteFile(ctx, pdfPath); err != nil {
				log.Printf("[ERROR] Failed to delete PDF file: %v", err)
			}
		}
		if thumbPath != "" {
			log.Printf("Deleting Thumbnail: %s...", thumbPath)
			if err := repo.DeleteFile(ctx, thumbPath); err != nil {
				log.Printf("[ERROR] Failed to delete Thumbnail file: %v", err)
			}
		}

		// Delete Orphan Tags
		for _, t := range orphanTags {
			log.Printf("Deleting unused tag: %s...", t.Name)
			if err := repo.DeleteTag(ctx, t.ID); err != nil {
				log.Printf("[ERROR] Failed to delete tag %s: %v", t.Name, err)
			}
		}

		log.Println("[SUCCESS] Deletion complete.")
	},
}

func init() {
	rootCmd.AddCommand(deleteCmd)
	deleteCmd.Flags().BoolVarP(&forceDelete, "force", "f", false, "Force delete without confirmation")
}

func extractPathFromURL(fullURL, supabaseURL, bucketName string) (string, error) {
	// Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
	// We want <path>
	// Simple parsing:
	// 1. Parse URL
	u, err := url.Parse(fullURL)
	if err != nil {
		return "", err
	}
	// u.Path should be /storage/v1/object/public/<bucket>/<path>
	prefix := fmt.Sprintf("/storage/v1/object/public/%s/", bucketName)
	if strings.HasPrefix(u.Path, prefix) {
		return strings.TrimPrefix(u.Path, prefix), nil
	}
	// Try without leading slash in prefix just in case
	prefixNoSlash := fmt.Sprintf("storage/v1/object/public/%s/", bucketName)
	if strings.HasPrefix(u.Path, prefixNoSlash) {
		return strings.TrimPrefix(u.Path, prefixNoSlash), nil
	}
	
	return "", fmt.Errorf("url does not match expected storage format")
}
