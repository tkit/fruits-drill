package cmd

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/cms"
	"github.com/tkit/fruits-drill/tools/internal/config"
	"github.com/tkit/fruits-drill/tools/internal/thumbnail"
	"github.com/tkit/fruits-drill/tools/internal/uploader"
)

var registerCmd = &cobra.Command{
	Use:     "register [files...]",
	Aliases: []string{"draft"},
	Short:   "Upload and register PDF drills",
	Long:    `Scans for PDF files (or accepts file arguments), generates thumbnails, uploads to R2, and registers to MicroCMS as Draft.`,
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
		r2Uploader, err := uploader.NewR2Uploader(ctx, cfg)
		if err != nil {
			log.Fatalf("Failed to initialize R2 uploader: %v", err)
		}
		thumbGen := thumbnail.NewGenerator()
		cmsClient, err := cms.NewClient(cfg)
		if err != nil {
			log.Fatalf("Failed to initialize CMS client: %v", err)
		}

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
				tags = append(tags, strings.TrimSpace(s))
			}
		}

		// 4. Process Loop
		for _, pdfPath := range pdfFiles {
			processFile(ctx, pdfPath, r2Uploader, thumbGen, cmsClient, tags, descRaw)
		}
	},
}

func init() {
	rootCmd.AddCommand(registerCmd)
	registerCmd.Flags().StringVar(&tagsRaw, "tags", "", "Comma-separated tags")
	registerCmd.Flags().StringVar(&descRaw, "desc", "", "Description text")
}

// Logic copied from root.go (and improved slightly for context usage if needed)
// Note: processFile helpers and others should optionally be shared or duplicated.
// For now, I'll put processFile here as it belongs to registration logic.

func processFile(ctx context.Context, pdfPath string, r2 *uploader.R2Uploader, tb *thumbnail.Generator, c *cms.Client, tags []string, desc string) {
	log.Printf("Processing: %s", pdfPath)

	// Thumbnail
	log.Println("  -> Generating thumbnail...")
	thumbPath, err := tb.GenerateFromPDF(pdfPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to generate thumbnail: %v", err)
		return
	}
	defer os.Remove(thumbPath)

	// Upload PDF
	log.Println("  -> Uploading PDF to R2...")
	pdfURL, err := r2.UploadFile(ctx, pdfPath, "drills/pdf")
	if err != nil {
		log.Printf("  [ERROR] Failed to upload PDF: %v", err)
		return
	}
	log.Printf("     %s", pdfURL)

	// Upload Thumbnail
	log.Println("  -> Uploading Thumbnail to MicroCMS...")
	thumbURL, err := c.UploadMedia(thumbPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to upload thumbnail: %v", err)
		return
	}
	log.Printf("     %s", thumbURL)

	// Register
	log.Println("  -> Registering to MicroCMS...")
	title := strings.TrimSuffix(filepath.Base(pdfPath), filepath.Ext(pdfPath))

	content := cms.DrillContent{
		Title:       title,
		Thumbnail:   thumbURL,
		PDF:         pdfURL,
		Tags:        tags,
		Description: desc,
	}

	id, err := c.RegisterDrill(content)
	if err != nil {
		log.Printf("  [ERROR] Failed to register: %v", err)
		return
	}

	log.Printf("  [SUCCESS] Draft created. Content ID: %s", id)
	log.Printf("  To publish this item, run: fruits-cli publish %s", id)
}
