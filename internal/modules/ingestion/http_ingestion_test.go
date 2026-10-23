package ingestion

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRenderRawRedactsCredentials(t *testing.T) {
	req := &IngestionRequest{
		Request: Request{
			Method: "POST",
			Headers: map[string]string{
				"Authorization": "Bearer supersecret",
				"Cookie":        "session=abc123",
				"X-Api-Key":     "key123",
				"Content-Type":  "application/json",
			},
		},
		Response: Response{
			Status:  200,
			Headers: map[string]string{"Set-Cookie": "session=abc123", "Content-Type": "text/html"},
			Body:    "<html>ok</html>",
		},
	}

	u, err := url.Parse("https://example.com/api/login")
	assert.NoError(t, err)

	raw := renderRawRequest(req, u)
	assert.NotContains(t, raw, "supersecret")
	assert.NotContains(t, raw, "abc123")
	assert.NotContains(t, raw, "key123")
	assert.Contains(t, raw, "[REDACTED]")
	assert.Contains(t, raw, "application/json")

	res := renderRawResponse(req)
	assert.NotContains(t, res, "abc123")
	assert.Contains(t, res, "text/html")
}
