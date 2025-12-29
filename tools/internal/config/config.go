package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	R2AccountID           string `yaml:"r2_account_id"`
	R2AccessKeyID         string `yaml:"r2_access_key_id"`
	R2SecretAccessKey     string `yaml:"r2_secret_access_key"`
	R2BucketName          string `yaml:"r2_bucket_name"`
	R2PublicDomain        string `yaml:"r2_public_domain"`
	MicroCMSServiceDomain string `yaml:"microcms_service_domain"`
	MicroCMSAPIKey        string `yaml:"microcms_management_api_key"` // Key name matches env for consistency
}

func Load() (*Config, error) {
	// Defaults from Env
	cfg := &Config{
		R2AccountID:           os.Getenv("R2_ACCOUNT_ID"),
		R2AccessKeyID:         os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretAccessKey:     os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2BucketName:          os.Getenv("R2_BUCKET_NAME"),
		R2PublicDomain:        os.Getenv("R2_PUBLIC_DOMAIN"),
		MicroCMSServiceDomain: os.Getenv("MICROCMS_SERVICE_DOMAIN"),
		MicroCMSAPIKey:        os.Getenv("MICROCMS_MANAGEMENT_API_KEY"),
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
