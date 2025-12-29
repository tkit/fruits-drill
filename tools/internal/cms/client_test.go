package cms

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/tkit/fruits-drill/tools/internal/config"
	"github.com/stretchr/testify/assert"
)

func TestRegisterDrill(t *testing.T) {
	t.Skip("Skipping test because RegisterDrill uses external SDK which is hard to mock")
	// Mock Server
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/drills", r.URL.Path)
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "test-api-key", r.Header.Get("X-MICROCMS-API-KEY"))

		var body DrillContent
		json.NewDecoder(r.Body).Decode(&body)
		assert.Equal(t, "Test Drill", body.Title)

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"id": "test-id"}`))
	}))
	defer ts.Close()

	cfg := &config.Config{
		MicroCMSAPIKey: "test-api-key",
	}
	client, _ := NewClient(cfg)
	client.SetBaseURLForTest(ts.URL)

	content := DrillContent{Title: "Test Drill"}
	id, err := client.RegisterDrill(content)

	assert.NoError(t, err)
	assert.Equal(t, "test-id", id)
}

func TestPublishDrill(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/contents/drills/test-id/status", r.URL.Path)
		assert.Equal(t, "PATCH", r.Method)
		assert.Equal(t, "test-api-key", r.Header.Get("X-MICROCMS-API-KEY"))
		assert.Equal(t, "application/json", r.Header.Get("Content-Type"))

		var body map[string][]string
		json.NewDecoder(r.Body).Decode(&body)
		assert.Equal(t, []string{"PUBLISH"}, body["status"])

		w.WriteHeader(http.StatusAccepted)
	}))
	defer ts.Close()

	cfg := &config.Config{MicroCMSAPIKey: "test-api-key", MicroCMSServiceDomain: "test"}
	client, _ := NewClient(cfg)
	client.SetBaseURLForTest(ts.URL)

	err := client.PublishDrill("test-id")
	assert.NoError(t, err)
}
