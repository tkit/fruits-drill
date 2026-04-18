package cmd

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"github.com/tkit/fruits-drill/tools/internal/adminapi"
)

var forceDelete bool

var deleteCmd = &cobra.Command{
	Use:   "delete [title]",
	Short: "Delete a drill by title",
	Long:  `Deletes a drill and associated assets via the Cloudflare admin API.`,
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		title := strings.TrimSpace(args[0])
		if title == "" {
			log.Fatalf("Title must not be empty")
		}

		cfg, err := loadConfig()
		if err != nil {
			log.Fatalf("Failed to load config: %v", err)
		}
		if err := cfg.Validate(); err != nil {
			log.Fatalf("Invalid configuration: %v", err)
		}

		if !forceDelete {
			fmt.Println("The following resource will be DELETED:")
			fmt.Printf("  Drill title: %s\n", title)
			fmt.Print("\nAre you sure you want to continue? [y/N]: ")

			reader := bufio.NewReader(os.Stdin)
			input, _ := reader.ReadString('\n')
			input = strings.TrimSpace(strings.ToLower(input))
			if input != "y" {
				fmt.Println("Operation cancelled.")
				return
			}
		}

		client := adminapi.NewClient(cfg.AdminAPIBaseURL, cfg.AdminAPIToken)
		resp, err := client.DeleteDrill(context.Background(), adminapi.DeleteDrillRequest{
			Title:       title,
			DeleteFiles: true,
		})
		if err != nil {
			log.Fatalf("Failed to delete drill via admin API: %v", err)
		}

		log.Printf("[SUCCESS] Deleted drill: [%s] %s", resp.ID, resp.Title)
		if len(resp.DeletedKeys) > 0 {
			log.Printf("[INFO] Deleted %d file(s): %s", len(resp.DeletedKeys), strings.Join(resp.DeletedKeys, ", "))
		}

		revalidate(cfg, "drills")
	},
}

func init() {
	rootCmd.AddCommand(deleteCmd)
	deleteCmd.Flags().BoolVarP(&forceDelete, "force", "f", false, "Force delete without confirmation")
}
