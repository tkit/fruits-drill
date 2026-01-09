package cmd

import (
	"fmt"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/config"
)

var (
	configPath string
	tagsRaw    string
	descRaw    string
	titleRaw   string
)

var rootCmd = &cobra.Command{
	Use:   "fruits-cli",
	Short: "Upload and register PDF drills",
	Long:  `Scans for PDF files (or accepts file arguments), generates thumbnails, uploads to Supabase Storage, and registers to Supabase DB.`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	// Load .env file if it exists
	_ = godotenv.Load()
	rootCmd.PersistentFlags().StringVarP(&configPath, "config", "c", "", "Path to config file")
}

func loadConfig() (*config.Config, error) {
	if configPath != "" {
		return config.LoadFromFile(configPath)
	}
	return config.Load()
}

func revalidate(cfg *config.Config, tag string) {
	if cfg.AppURL == "" || cfg.RevalidateToken == "" {
		fmt.Println("[INFO] Skipping revalidation: app_url or revalidate_token not set.")
		return
	}

	url := fmt.Sprintf("%s/api/revalidate?tag=%s&secret=%s", cfg.AppURL, tag, cfg.RevalidateToken)
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("[WARNING] Failed to request revalidation: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("[WARNING] Revalidation failed with status: %s\n", resp.Status)
		return
	}

	fmt.Printf("[SUCCESS] Revalidation trigger send for tag: %s\n", tag)
}
