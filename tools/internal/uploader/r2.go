package uploader

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	myConfig "github.com/tkit/fruits-drill/tools/internal/config"
)

type R2Uploader struct {
	client     *s3.Client
	bucketName string
	publicURL  string
}

func NewR2Uploader(ctx context.Context, cfg *myConfig.Config) (*R2Uploader, error) {
	if cfg.R2AccountID == "" || cfg.R2AccessKeyID == "" || cfg.R2SecretAccessKey == "" || cfg.R2BucketName == "" {
		return nil, fmt.Errorf("R2 configuration is missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)")
	}

	// R2 is S3-compatible. We use AWS SDK v2.
	// Endpoint: https://<accountid>.r2.cloudflarestorage.com
	r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.R2AccountID)

	awsCfg, err := config.LoadDefaultConfig(ctx,
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.R2AccessKeyID,
			cfg.R2SecretAccessKey,
			"",
		)),
		config.WithRegion("auto"), // R2 region is usually 'auto' or 'us-east-1' equivalent
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(r2Endpoint)
	})

	return &R2Uploader{
		client:     client,
		bucketName: cfg.R2BucketName,
		publicURL:  cfg.R2PublicDomain,
	}, nil
}

// UploadFile uploads a file to R2 and returns the public URL.
// keyPrefix allows organizing files in folders (e.g. "drills/").
func (u *R2Uploader) UploadFile(ctx context.Context, filePath string, keyPrefix string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open file %s: %w", filePath, err)
	}
	defer file.Close()

	fileName := filepath.Base(filePath)
	key := filepath.Join(keyPrefix, fileName)

	// Determine content type (simplified)
	contentType := "application/octet-stream"
	if filepath.Ext(fileName) == ".pdf" {
		contentType = "application/pdf"
	} else if filepath.Ext(fileName) == ".jpg" {
		contentType = "image/jpeg"
	}

	_, err = u.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(u.bucketName),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload object %s: %w", key, err)
	}

	// Return public URL
	// Assumes R2_PUBLIC_DOMAIN is like "https://pub-xxx.r2.dev"
	publicURL := fmt.Sprintf("%s/%s", u.publicURL, key)
	return publicURL, nil
}
