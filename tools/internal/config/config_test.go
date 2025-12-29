package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad_Env(t *testing.T) {
	// Setup env
	os.Setenv("R2_BUCKET_NAME", "test-bucket")
	defer os.Unsetenv("R2_BUCKET_NAME")

	cfg, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, "test-bucket", cfg.R2BucketName)
}

func TestLoadFromFile(t *testing.T) {
	// Create temp file
	f, err := os.CreateTemp("", "config_*.yaml")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(f.Name())

	content := `
r2_bucket_name: "yaml-bucket"
microcms_service_domain: "example"
`
	f.WriteString(content)
	f.Close()

	cfg, err := LoadFromFile(f.Name())
	assert.NoError(t, err)
	assert.Equal(t, "yaml-bucket", cfg.R2BucketName)
	assert.Equal(t, "example", cfg.MicroCMSServiceDomain)
}


