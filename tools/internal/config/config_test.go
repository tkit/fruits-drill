package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad_Env(t *testing.T) {
	// Setup env
	os.Setenv("ADMIN_API_BASE_URL", "https://example.workers.dev")
	os.Setenv("ADMIN_API_TOKEN", "test-token")
	defer os.Unsetenv("ADMIN_API_BASE_URL")
	defer os.Unsetenv("ADMIN_API_TOKEN")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "https://example.workers.dev", cfg.AdminAPIBaseURL)
	assert.Equal(t, "test-token", cfg.AdminAPIToken)
}

func TestLoadFromFile(t *testing.T) {
	// Create temp file
	f, err := os.CreateTemp("", "config_*.yaml")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(f.Name())

	content := `
admin_api_base_url: "https://example.workers.dev"
admin_api_token: "yaml-token"
`
	f.WriteString(content)
	f.Close()

	cfg, err := LoadFromFile(f.Name())
	assert.NoError(t, err)
	assert.Equal(t, "https://example.workers.dev", cfg.AdminAPIBaseURL)
	assert.Equal(t, "yaml-token", cfg.AdminAPIToken)
}
