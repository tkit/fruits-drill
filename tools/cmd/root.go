package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	configPath string
	tagsRaw    string
	descRaw    string
)

var rootCmd = &cobra.Command{
	Use:   "fruits-cli",
	Short: "Upload and register PDF drills",
	Long:  `Scans for PDF files (or accepts file arguments), generates thumbnails, uploads to R2, and registers to MicroCMS as Draft.`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().StringVarP(&configPath, "config", "c", "", "Path to config file")
}

