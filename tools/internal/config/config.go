package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	// Supabase
	SupabaseURL            string `yaml:"supabase_url"`
	SupabaseServiceRoleKey string `yaml:"supabase_service_role_key"`
	SupabaseBucketName     string `yaml:"supabase_bucket_name"`
}

func Load() (*Config, error) {
	// Defaults from Env
	cfg := &Config{
		SupabaseURL:            os.Getenv("SUPABASE_URL"),
		SupabaseServiceRoleKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		SupabaseBucketName:     os.Getenv("SUPABASE_BUCKET_NAME"),
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
