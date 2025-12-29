package cmd

import (
	"log"

	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/cms"
	"github.com/tkit/fruits-drill/tools/internal/config"
)

var publishCmd = &cobra.Command{
	Use:   "publish [content-id]",
	Short: "Publish a draft content",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		contentID := args[0]

		// Load Config (reused logic could be refactored, but simple enough here)
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

		cmsClient, err := cms.NewClient(cfg)
		if err != nil {
			log.Fatalf("Failed to initialize CMS client: %v", err)
		}
		log.Printf("Publishing content ID: %s", contentID)
		if err := cmsClient.PublishDrill(contentID); err != nil {
			log.Fatalf("Failed to publish: %v", err)
		}
		log.Println("[SUCCESS] Published successfully.")
	},
}

func init() {
	rootCmd.AddCommand(publishCmd)
}
