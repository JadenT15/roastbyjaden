package app

import (
	"testing"
	"time"
)

func TestSignAndVerifyToken(t *testing.T) {
	secret := "this-secret-is-long-enough-for-tests"
	claims := tokenClaims{
		Sub:   "admin-1",
		Email: "seller@roastbyjaden.local",
		Role:  "seller",
		Exp:   time.Now().Add(time.Hour).Unix(),
	}

	token, err := signToken(secret, claims)
	if err != nil {
		t.Fatalf("signToken returned error: %v", err)
	}

	verified, err := verifyToken(secret, token)
	if err != nil {
		t.Fatalf("verifyToken returned error: %v", err)
	}
	if verified.Email != claims.Email || verified.Role != claims.Role || verified.Sub != claims.Sub {
		t.Fatalf("verified claims mismatch: got %+v want %+v", verified, claims)
	}
}

func TestVerifyTokenRejectsWrongSecret(t *testing.T) {
	token, err := signToken("this-secret-is-long-enough-for-tests", tokenClaims{
		Sub: "admin-1",
		Exp: time.Now().Add(time.Hour).Unix(),
	})
	if err != nil {
		t.Fatalf("signToken returned error: %v", err)
	}

	if _, err := verifyToken("a-different-secret-that-is-long-enough", token); err == nil {
		t.Fatal("verifyToken accepted a token signed with another secret")
	}
}

func TestVerifyTokenRejectsExpiredToken(t *testing.T) {
	secret := "this-secret-is-long-enough-for-tests"
	token, err := signToken(secret, tokenClaims{
		Sub: "admin-1",
		Exp: time.Now().Add(-time.Minute).Unix(),
	})
	if err != nil {
		t.Fatalf("signToken returned error: %v", err)
	}

	if _, err := verifyToken(secret, token); err == nil {
		t.Fatal("verifyToken accepted an expired token")
	}
}
