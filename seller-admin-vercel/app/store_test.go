package app

import "testing"

func TestSlugifyUsesASCIIWords(t *testing.T) {
	got := slugify("Roast Duck Rice!")
	if got != "roast-duck-rice" {
		t.Fatalf("slugify() = %q, want %q", got, "roast-duck-rice")
	}
}

func TestSlugifyReturnsEmptyForChineseName(t *testing.T) {
	got := slugify("招牌烧鸭腿饭")
	if got != "" {
		t.Fatalf("slugify() = %q, want empty string", got)
	}
}

func TestOrderStatusesIncludesPacking(t *testing.T) {
	if !OrderStatuses["PACKING"] {
		t.Fatal("OrderStatuses should include PACKING for seller packing flow")
	}
}
