package app

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

const authCookieName = "rbj_admin_session"

type tokenClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Exp   int64  `json:"exp"`
}

func signToken(secret string, claims tokenClaims) (string, error) {
	header, err := json.Marshal(map[string]string{"alg": "HS256", "typ": "JWT"})
	if err != nil {
		return "", err
	}
	body, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	encodedHeader := base64.RawURLEncoding.EncodeToString(header)
	encodedBody := base64.RawURLEncoding.EncodeToString(body)
	unsigned := encodedHeader + "." + encodedBody
	signature := hmacSHA256(secret, unsigned)
	return unsigned + "." + signature, nil
}

func verifyToken(secret, token string) (tokenClaims, error) {
	var claims tokenClaims
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return claims, errors.New("invalid token")
	}

	expected := hmacSHA256(secret, parts[0]+"."+parts[1])
	if !hmac.Equal([]byte(expected), []byte(parts[2])) {
		return claims, errors.New("invalid signature")
	}

	body, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return claims, err
	}
	if err := json.Unmarshal(body, &claims); err != nil {
		return claims, err
	}
	if claims.Exp < time.Now().Unix() {
		return claims, errors.New("expired token")
	}
	return claims, nil
}

func hmacSHA256(secret, value string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(value))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func setAuthCookie(w http.ResponseWriter, cfg Config, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   cfg.CookieSecure,
		MaxAge:   60 * 60 * 12,
	})
}

func clearAuthCookie(w http.ResponseWriter, cfg Config) {
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   cfg.CookieSecure,
		MaxAge:   -1,
	})
}

func readAuthClaims(r *http.Request, cfg Config) (tokenClaims, error) {
	cookie, err := r.Cookie(authCookieName)
	if err != nil {
		return tokenClaims{}, fmt.Errorf("missing auth cookie")
	}
	return verifyToken(cfg.JWTSecret, cookie.Value)
}
