package adminapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type Client struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

func NewClient(baseURL, token string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		token:   token,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

type RegisterDrillRequest struct {
	ID              string   `json:"id,omitempty"`
	Title           string   `json:"title"`
	Description     string   `json:"description,omitempty"`
	PDFKey          string   `json:"pdfKey"`
	ThumbnailKey    string   `json:"thumbnailKey"`
	PDFBase64       string   `json:"pdfBase64"`
	ThumbnailBase64 string   `json:"thumbnailBase64"`
	Tags            []string `json:"tags,omitempty"`
}

type RegisterDrillResponse struct {
	ID        string `json:"id"`
	Created   bool   `json:"created"`
	Updated   bool   `json:"updated"`
	TagsCount int    `json:"tagsCount"`
}

type DeleteDrillRequest struct {
	ID          string `json:"id,omitempty"`
	Title       string `json:"title,omitempty"`
	PDFRef      string `json:"pdfRef,omitempty"`
	DeleteFiles bool   `json:"deleteFiles"`
}

type DeleteDrillResponse struct {
	Deleted     bool     `json:"deleted"`
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	DeletedKeys []string `json:"deletedKeys"`
}

func (c *Client) postJSON(ctx context.Context, path string, reqBody any, respBody any) error {
	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to encode request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		raw, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("api error: %s %s", resp.Status, strings.TrimSpace(string(raw)))
	}

	if respBody == nil {
		return nil
	}

	if err := json.NewDecoder(resp.Body).Decode(respBody); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}
	return nil
}

func (c *Client) RegisterDrill(ctx context.Context, payload RegisterDrillRequest) (*RegisterDrillResponse, error) {
	var result RegisterDrillResponse
	if err := c.postJSON(ctx, "/api/admin/drills/register", payload, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *Client) DeleteDrill(ctx context.Context, payload DeleteDrillRequest) (*DeleteDrillResponse, error) {
	var result DeleteDrillResponse
	if err := c.postJSON(ctx, "/api/admin/drills/delete", payload, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *Client) Revalidate(ctx context.Context, tag string) error {
	req := map[string]string{"tag": tag}
	return c.postJSON(ctx, "/api/revalidate", req, nil)
}
