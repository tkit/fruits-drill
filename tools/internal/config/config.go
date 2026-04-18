package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	// Deprecated Supabase settings (kept for backward-compatible parsing only).
	SupabaseURL            string `yaml:"supabase_url"`
	SupabaseServiceRoleKey string `yaml:"supabase_service_role_key"`
	SupabaseBucketName     string `yaml:"supabase_bucket_name"`

	AdminAPIBaseURL string `yaml:"admin_api_base_url"`
	AdminAPIToken   string `yaml:"admin_api_token"`
}

func Load() (*Config, error) {
	// Defaults from Env
	cfg := &Config{
		SupabaseURL:            os.Getenv("SUPABASE_URL"),
		SupabaseServiceRoleKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		SupabaseBucketName:     os.Getenv("SUPABASE_BUCKET_NAME"),
		AdminAPIBaseURL:        os.Getenv("ADMIN_API_BASE_URL"),
		AdminAPIToken:          os.Getenv("ADMIN_API_TOKEN"),
	}
	return cfg, nil
}

func LoadFromFile(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open config file: %w", err)
	}
	defer f.Close()

	var cfg Config
	if err := yaml.NewDecoder(f).Decode(&cfg); err != nil {
		return nil, fmt.Errorf("failed to decode config file: %w", err)
	}

	return &cfg, nil
}

func (c *Config) Validate() error {
	if c.AdminAPIBaseURL == "" {
		return fmt.Errorf("AdminAPIBaseURL is required (env: ADMIN_API_BASE_URL or yaml: admin_api_base_url)")
	}
	if c.AdminAPIToken == "" {
		return fmt.Errorf("AdminAPIToken is required (env: ADMIN_API_TOKEN or yaml: admin_api_token)")
	}
	return nil
}
