package cmd

import (
	"context"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/adminapi"
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
	Long:  `Scans PDF files, generates thumbnails, and registers drills via the Cloudflare admin API.`,
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
	if cfg.AdminAPIBaseURL == "" || cfg.AdminAPIToken == "" {
		fmt.Println("[INFO] Skipping revalidation: admin_api_base_url or admin_api_token not set.")
		return
	}

	client := adminapi.NewClient(cfg.AdminAPIBaseURL, cfg.AdminAPIToken)
	if err := client.Revalidate(context.Background(), tag); err != nil {
		fmt.Printf("[WARNING] Failed to request revalidation: %v\n", err)
		return
	}

	fmt.Printf("[SUCCESS] Revalidation trigger send for tag: %s\n", tag)
}
