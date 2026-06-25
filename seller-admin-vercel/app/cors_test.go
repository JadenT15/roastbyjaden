package app

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFileOriginCanPreflightPublicOrdersWithoutCredentials(t *testing.T) {
	server := NewServer(Config{}, Store{})
	request := httptest.NewRequest(http.MethodOptions, "/api/orders", nil)
	request.Header.Set("Origin", "null")
	request.Header.Set("Access-Control-Request-Method", http.MethodPost)
	request.Header.Set("Access-Control-Request-Headers", "Content-Type")
	response := httptest.NewRecorder()

	server.Handler().ServeHTTP(response, request)

	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "null" {
		t.Fatalf("allow origin = %q, want null", got)
	}
	if got := response.Header().Get("Access-Control-Allow-Credentials"); got != "" {
		t.Fatalf("file origin should not allow credentials, got %q", got)
	}
}

func TestFileOriginCannotPreflightAdminEndpoints(t *testing.T) {
	server := NewServer(Config{}, Store{})
	request := httptest.NewRequest(http.MethodOptions, "/api/admin/orders", nil)
	request.Header.Set("Origin", "null")
	request.Header.Set("Access-Control-Request-Method", http.MethodGet)
	response := httptest.NewRecorder()

	server.Handler().ServeHTTP(response, request)

	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("admin allow origin = %q, want empty", got)
	}
}
