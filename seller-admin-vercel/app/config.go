package app

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	DatabaseURL    string
	JWTSecret      string
	FrontendOrigin string
	Port           string
	CookieSecure   bool
	N8NWebhookSecret string
}

func LoadConfig() (Config, error) {
	loadDotEnv(".env")

	cfg := Config{
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		JWTSecret:      os.Getenv("JWT_SECRET"),
		FrontendOrigin: os.Getenv("FRONTEND_ORIGIN"),
		Port:           getenv("PORT", "8080"),
		CookieSecure:   getenv("COOKIE_SECURE", getenv("VERCEL", "false")) == "true",
		N8NWebhookSecret: os.Getenv("N8N_WEBHOOK_SECRET"),
	}
	if cfg.FrontendOrigin == "" {
		cfg.FrontendOrigin = "http://127.0.0.1:4173"
	}
	if cfg.DatabaseURL == "" {
		return cfg, fmt.Errorf("DATABASE_URL is required")
	}
	if len(cfg.JWTSecret) < 32 {
		return cfg, fmt.Errorf("JWT_SECRET must be at least 32 characters")
	}
	return cfg, nil
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func boolFromEnv(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func loadDotEnv(path string) {
	content, err := os.ReadFile(path)
	if err != nil {
		return
	}

	for _, line := range strings.Split(string(content), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key == "" || os.Getenv(key) != "" {
			continue
		}
		os.Setenv(key, value)
	}
}
