package cmd

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
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
