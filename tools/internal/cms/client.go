package cms

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"os"
	"path/filepath"

	"github.com/microcmsio/microcms-go-sdk"
	"github.com/tkit/fruits-drill/tools/internal/config"
)

type Client struct {
	httpClient *http.Client
	baseURL    string // Maintained for manual calls (Upload/Publish)
	serviceID  string
	apiKey     string
	sdkClient  *microcms.Client
}

func NewClient(cfg *config.Config) (*Client, error) {
	if cfg.MicroCMSServiceDomain == "" || cfg.MicroCMSAPIKey == "" {
		return nil, fmt.Errorf("MicroCMS configuration is missing (MICROCMS_SERVICE_DOMAIN, MICROCMS_MANAGEMENT_API_KEY)")
	}

	// Base URL for Management API: https://{service-id}.microcms-management.io/api/v1
	baseURL := fmt.Sprintf("https://%s.microcms-management.io/api/v1", cfg.MicroCMSServiceDomain)
	
	sdk := microcms.New(cfg.MicroCMSServiceDomain, cfg.MicroCMSAPIKey)

	return &Client{
		httpClient: &http.Client{},
		baseURL:    baseURL,
		serviceID:  cfg.MicroCMSServiceDomain,
		apiKey:     cfg.MicroCMSAPIKey,
		sdkClient:  sdk,
	}, nil
}

// SetBaseURLForTest allows overriding the base URL for testing
func (c *Client) SetBaseURLForTest(url string) {
	c.baseURL = url
}

// UploadMedia uploads an image to MicroCMS Management API and returns the URL.
// Endpoint: POST https://<service>.microcms-management.io/api/v1/media
func (c *Client) UploadMedia(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open file %s: %w", filePath, err)
	}
	defer file.Close()

	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	
	// 'file' field is required
	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="%s"`, filepath.Base(filePath)))
	h.Set("Content-Type", "image/jpeg") // Generator always produces .jpg
	fw, err := w.CreatePart(h)
	if err != nil {
		return "", fmt.Errorf("failed to create form part: %w", err)
	}
	if _, err = io.Copy(fw, file); err != nil {
		return "", fmt.Errorf("failed to copy file content: %w", err)
	}
	w.Close()

	url := fmt.Sprintf("%s/media", c.baseURL)
	req, err := http.NewRequest("POST", url, &b)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", w.FormDataContentType())
	req.Header.Set("X-MICROCMS-API-KEY", c.apiKey)
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		URL string `json:"url"`
	}

	
	// Wait, I read body in error case.
	// In success case, I haven't read it.
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	return result.URL, nil
}

type DrillContent struct {
	Title       string   `json:"title"`
	Thumbnail   string   `json:"thumbnail"` // URL of the image
	PDF         string   `json:"pdf"`       // URL of the PDF (R2)
	Tags        []string `json:"tags,omitempty"`
	Description string   `json:"description,omitempty"`
}

// RegisterDrill creates a new content in 'drills' endpoint using SDK.
func (c *Client) RegisterDrill(drill DrillContent) (string, error) {
	tags := drill.Tags
	if tags == nil {
		tags = []string{}
	}

	// Convert DrillContent to map for SDK
	data := map[string]interface{}{
		"title":       drill.Title,
		"thumbnail":   drill.Thumbnail,
		"pdf":         drill.PDF,
		"tags":        tags,
		"description": drill.Description,
	}

	res, err := c.sdkClient.Create(microcms.CreateParams{
		Endpoint: "drills",
		Content:  data,
		Status:   microcms.StatusDraft, // Explicitly set as Draft
	})
	if err != nil {
		return "", fmt.Errorf("failed to register content via SDK: %w", err)
	}

	return res.ID, nil
}

// PublishDrill publishes a content by its ID.
// PublishDrill publishes a content by its ID.
// Endpoint: PATCH <baseURL>/contents/drills/<id>/status
func (c *Client) PublishDrill(contentID string) error {
	url := fmt.Sprintf("%s/contents/drills/%s/status", c.baseURL, contentID)
	
	// Body: { "status": ["PUBLISH"] }
	body := map[string][]string{
		"status": {"PUBLISH"},
	}
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("failed to marshal status body: %w", err)
	}

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-MICROCMS-API-KEY", c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted && resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("publish failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}
