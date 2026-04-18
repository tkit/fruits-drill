package cmd

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/adminapi"
	"github.com/tkit/fruits-drill/tools/internal/thumbnail"
)

var registerCmd = &cobra.Command{
	Use:     "register [files...]",
	Aliases: []string{"draft"},
	Short:   "Upload and register PDF drills",
	Long:    `Scans for PDF files, generates thumbnails, uploads files via Admin API, and registers drills to D1.`,
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
		client := adminapi.NewClient(cfg.AdminAPIBaseURL, cfg.AdminAPIToken)
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
			processFile(ctx, pdfPath, client, thumbGen, tags, descRaw, titleRaw)
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

func processFile(ctx context.Context, pdfPath string, client *adminapi.Client, tb *thumbnail.Generator, tags []string, desc, titleOverride string) {
	log.Printf("Processing: %s", pdfPath)

	// 1. Calculate Hash of the PDF
	hash, err := calculateFileHash(pdfPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to calculate hash: %v", err)
		return
	}
	log.Printf("  -> File Hash: %s", hash)

	// 2. Define deterministic keys for idempotent registration.
	pdfKey := fmt.Sprintf("pdf/%s.pdf", hash)
	thumbKey := fmt.Sprintf("thumbnail/%s.png", hash)

	// 3. Thumbnail Generation (New Drill)
	log.Println("  -> Generating thumbnail...")
	thumbPath, err := tb.GenerateFromPDF(pdfPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to generate thumbnail: %v", err)
		return
	}
	defer os.Remove(thumbPath)

	// 4. Read file contents for API upload.
	pdfBytes, err := os.ReadFile(pdfPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to read PDF: %v", err)
		return
	}

	thumbBytes, err := os.ReadFile(thumbPath)
	if err != nil {
		log.Printf("  [ERROR] Failed to read thumbnail: %v", err)
		return
	}

	// 5. Register (and upload files through the admin API).
	log.Println("  -> Registering via admin API...")
	title := titleOverride
	if title == "" {
		title = strings.TrimSuffix(filepath.Base(pdfPath), filepath.Ext(pdfPath))
	}

	result, err := client.RegisterDrill(ctx, adminapi.RegisterDrillRequest{
		Title:           title,
		Description:     desc,
		PDFKey:          pdfKey,
		ThumbnailKey:    thumbKey,
		PDFBase64:       base64.StdEncoding.EncodeToString(pdfBytes),
		ThumbnailBase64: base64.StdEncoding.EncodeToString(thumbBytes),
		Tags:            tags,
	})
	if err != nil {
		log.Printf("  [ERROR] Failed to register: %v", err)
		return
	}

	status := "updated"
	if result.Created {
		status = "created"
	}
	log.Printf("  [SUCCESS] Drill %s. ID: %s", status, result.ID)
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
