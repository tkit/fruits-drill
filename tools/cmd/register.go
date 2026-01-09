package cmd

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
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
		cfg, err := loadConfig()
		if err != nil {
			log.Fatalf("Failed to load config: %v", err)
		}

		if err := cfg.Validate(); err != nil {
			log.Fatalf("Invalid configuration: %v", err)
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

		if len(pdfFiles) > 1 && titleRaw != "" {
			log.Fatalf("Cannot specify --title when registering multiple files.")
		}

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
		// 4. Process Loop
		for _, pdfPath := range pdfFiles {
			processFile(ctx, pdfPath, repo, thumbGen, tags, descRaw, titleRaw)
		}

		// 5. Revalidate
		revalidate(cfg, "drills")
	},
}

func init() {
	rootCmd.AddCommand(registerCmd)
	registerCmd.Flags().StringVar(&tagsRaw, "tags", "", "Comma-separated tags")
	registerCmd.Flags().StringVar(&descRaw, "desc", "", "Description text")
	registerCmd.Flags().StringVar(&titleRaw, "title", "", "Title override (if registering single file)")
}

func processFile(ctx context.Context, pdfPath string, repo *repository.SupabaseRepository, tb *thumbnail.Generator, tags []string, desc, titleOverride string) {
	log.Printf("Processing: %s", pdfPath)

	// 1. Calculate Hash of the PDF
	hash, err := calculateFileHash(pdfPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to calculate hash: %v", err)
		return
	}
	log.Printf("  -> File Hash: %s", hash)

	// 2. Check if Drill already exists by PDF URL (Content)
	// Key: pdf/<HASH>.pdf
	pdfKey := fmt.Sprintf("pdf/%s.pdf", hash)
	pdfURL := repo.GetPublicURL(pdfKey)

	existingDrill, err := repo.GetDrillByPDFURL(ctx, pdfURL)
	if err != nil {
		log.Printf("  [ERROR] Failed to check for existing drill: %v", err)
		return
	}

	if existingDrill != nil {
		log.Printf("  [INFO] Drill already exists (ID: %s). Skipping upload.", existingDrill.ID)
		log.Println("  -> Updating tags...")
		if err := repo.SyncTags(ctx, existingDrill.ID, tags); err != nil {
			log.Printf("  [ERROR] Failed to sync tags: %v", err)
		} else {
			log.Println("  [SUCCESS] Tags updated.")
		}
		return
	}

	// 3. Thumbnail Generation (New Drill)
	log.Println("  -> Generating thumbnail...")
	thumbPath, err := tb.GenerateFromPDF(pdfPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to generate thumbnail: %v", err)
		return
	}
	defer os.Remove(thumbPath)

	// 4. Upload PDF
	log.Println("  -> Uploading PDF to Supabase Storage...")
	uploadedPDFURL, err := repo.UploadFile(ctx, pdfPath, pdfKey)
	if err != nil {
		log.Printf("  [ERROR] Failed to upload PDF: %v", err)
		return
	}
	log.Printf("     %s", uploadedPDFURL)

	// 5. Upload Thumbnail
	// We can use the same hash for thumbnail key too? or keep random UUID?
	// Existing plan said: "pdf/<HASH>.pdf". It didn't specify thumbnail.
	// But if we want complete deduplication, we should probably hash the thumbnail too or just use the same hash (pdf hash) for the thumbnail filename.
	// Let's use the PDF hash for the thumbnail too to keep them related.
	log.Println("  -> Uploading Thumbnail to Supabase Storage...")
	thumbKey := fmt.Sprintf("thumbnail/%s.png", hash)
	thumbURL, err := repo.UploadFile(ctx, thumbPath, thumbKey)
	if err != nil {
		log.Printf("  [ERROR] Failed to upload thumbnail: %v", err)
		return
	}
	log.Printf("     %s", thumbURL)

	// 6. Register
	log.Println("  -> Registering to Supabase DB...")
	title := titleOverride
	if title == "" {
		title = strings.TrimSuffix(filepath.Base(pdfPath), filepath.Ext(pdfPath))
	}

	id, err := repo.RegisterDrill(ctx, title, desc, uploadedPDFURL, thumbURL, tags)
	if err != nil {
		log.Printf("  [ERROR] Failed to register: %v", err)
		return
	}

	log.Printf("  [SUCCESS] Drill registered. ID: %s", id)
}

func calculateFileHash(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}

	return hex.EncodeToString(h.Sum(nil)), nil
}
