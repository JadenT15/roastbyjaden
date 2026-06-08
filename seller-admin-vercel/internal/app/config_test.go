package app

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadDotEnvSetsMissingValues(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, ".env")
	if err := os.WriteFile(path, []byte("JWT_SECRET=from-file\nPORT=9090\n"), 0600); err != nil {
		t.Fatalf("write .env: %v", err)
	}
	t.Setenv("JWT_SECRET", "")
	t.Setenv("PORT", "")

	loadDotEnv(path)

	if os.Getenv("JWT_SECRET") != "from-file" {
		t.Fatalf("JWT_SECRET = %q, want from-file", os.Getenv("JWT_SECRET"))
	}
	if os.Getenv("PORT") != "9090" {
		t.Fatalf("PORT = %q, want 9090", os.Getenv("PORT"))
	}
}

func TestLoadDotEnvDoesNotOverrideExistingValues(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, ".env")
	if err := os.WriteFile(path, []byte("PORT=9090\n"), 0600); err != nil {
		t.Fatalf("write .env: %v", err)
	}
	t.Setenv("PORT", "8080")

	loadDotEnv(path)

	if os.Getenv("PORT") != "8080" {
		t.Fatalf("PORT = %q, want existing value 8080", os.Getenv("PORT"))
	}
}
