package cmd

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/config"
	"github.com/tkit/fruits-drill/tools/internal/repository"
	"github.com/tkit/fruits-drill/tools/internal/thumbnail"
)

var registerCmd = &cobra.Command{
	Use:     "register [files...]",
	Aliases: []string{"draft"},
	Short:   "Upload and register PDF drills",
	Long:    `Scans for PDF files (or accepts file arguments), generates thumbnails, uploads to Supabase Storage, and registers to Supabase DB.`,
	Args:    cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		// 1. Load Config
		var cfg *config.Config
		var err error
		if configPath != "" {
			cfg, err = config.LoadFromFile(configPath)
			if err != nil {
				log.Fatalf("Failed to load config from %s: %v", configPath, err)
			}
		} else {
			cfg, err = config.Load()
			if err != nil {
				log.Fatalf("Failed to load config: %v", err)
			}
		}

		// 2. Initialize Components
		ctx := context.Background()
		repo := repository.NewSupabaseRepository(cfg)
		thumbGen := thumbnail.NewGenerator()

		// 3. Process Files from Args
		var pdfFiles []string
		for _, arg := range args {
			matches, err := filepath.Glob(arg)
			if err != nil {
				log.Printf("Invalid glob pattern %s: %v", arg, err)
				continue
			}
			for _, m := range matches {
				if !strings.HasSuffix(strings.ToLower(m), ".pdf") {
					continue
				}
				pdfFiles = append(pdfFiles, m)
			}
		}

		if len(pdfFiles) == 0 {
			log.Println("No PDF files found.")
			return
		}

		log.Printf("Found %d PDF files.", len(pdfFiles))

		// Parse tags
		var tags []string
		if tagsRaw != "" {
			split := strings.Split(tagsRaw, ",")
			for _, s := range split {
				if trimmed := strings.TrimSpace(s); trimmed != "" {
					tags = append(tags, trimmed)
				}
			}
		}

		// 4. Process Loop
		for _, pdfPath := range pdfFiles {
			processFile(ctx, pdfPath, repo, thumbGen, tags, descRaw)
		}
	},
}

func init() {
	rootCmd.AddCommand(registerCmd)
	registerCmd.Flags().StringVar(&tagsRaw, "tags", "", "Comma-separated tags")
	registerCmd.Flags().StringVar(&descRaw, "desc", "", "Description text")
}

func processFile(ctx context.Context, pdfPath string, repo *repository.SupabaseRepository, tb *thumbnail.Generator, tags []string, desc string) {
	log.Printf("Processing: %s", pdfPath)

	// Thumbnail
	log.Println("  -> Generating thumbnail...")
	thumbPath, err := tb.GenerateFromPDF(pdfPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to generate thumbnail: %v", err)
		return
	}
	defer os.Remove(thumbPath)

	// Generate UUID for storage keys
	fileUUID := uuid.New().String()

	// Upload PDF
	log.Println("  -> Uploading PDF to Supabase Storage...")
	// Use UUID for storage key to avoid character issues
	pdfKey := fmt.Sprintf("pdf/%s.pdf", fileUUID)
	pdfURL, err := repo.UploadFile(ctx, pdfPath, pdfKey)
	if err != nil {
		log.Printf("  [ERROR] Failed to upload PDF: %v", err)
		return
	}
	log.Printf("     %s", pdfURL)

	// Upload Thumbnail
	log.Println("  -> Uploading Thumbnail to Supabase Storage...")
	thumbKey := fmt.Sprintf("thumbnail/%s.png", fileUUID)
	thumbURL, err := repo.UploadFile(ctx, thumbPath, thumbKey)
	if err != nil {
		log.Printf("  [ERROR] Failed to upload thumbnail: %v", err)
		return
	}
	log.Printf("     %s", thumbURL)

	// Register
	log.Println("  -> Registering to Supabase DB...")
	title := strings.TrimSuffix(filepath.Base(pdfPath), filepath.Ext(pdfPath))

	id, err := repo.RegisterDrill(ctx, title, desc, pdfURL, thumbURL, tags)
	if err != nil {
		log.Printf("  [ERROR] Failed to register: %v", err)
		return
	}

	log.Printf("  [SUCCESS] Drill registered. ID: %s", id)
}
