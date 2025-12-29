package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad_Env(t *testing.T) {
	// Setup env
	os.Setenv("SUPABASE_BUCKET_NAME", "test-bucket")
	defer os.Unsetenv("SUPABASE_BUCKET_NAME")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "test-bucket", cfg.SupabaseBucketName)
}

func TestLoadFromFile(t *testing.T) {
	// Create temp file
	f, err := os.CreateTemp("", "config_*.yaml")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(f.Name())

	content := `
supabase_bucket_name: "yaml-bucket"
supabase_url: "https://example.supabase.co"
`
	f.WriteString(content)
	f.Close()

	cfg, err := LoadFromFile(f.Name())
	assert.NoError(t, err)
	assert.Equal(t, "yaml-bucket", cfg.SupabaseBucketName)
	assert.Equal(t, "https://example.supabase.co", cfg.SupabaseURL)
}
