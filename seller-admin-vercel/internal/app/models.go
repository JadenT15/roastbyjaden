package app

import "time"

var OrderStatuses = map[string]bool{
	"NEW":              true,
	"ACCEPTED":         true,
	"PREPARING":        true,
	"READY":            true,
	"PACKING":          true,
	"OUT_FOR_DELIVERY": true,
	"DONE":             true,
	"CANCELLED":        true,
}

type Settings struct {
	OrderingOpen bool `json:"orderingOpen"`
}

type PublicState struct {
	Settings     Settings               `json:"settings"`
	ChoiceGroups map[string]ChoiceGroup `json:"choiceGroups"`
	Products     []Product              `json:"products"`
	Orders       []Order                `json:"orders"`
	Session      map[string]bool        `json:"session"`
}

type ChoiceGroup struct {
	ID      string         `json:"id"`
	Label   string         `json:"label"`
	Options []ChoiceOption `json:"options"`
}

type ChoiceOption struct {
	ID        string   `json:"id,omitempty"`
	Value     string   `json:"value"`
	Available bool     `json:"available"`
	Price     *float64 `json:"price,omitempty"`
}

type Product struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Category     string        `json:"category"`
	Price        float64       `json:"price"`
	Description  string        `json:"description"`
	Image        string        `json:"image"`
	Enabled      bool          `json:"enabled"`
	SoldOut      bool          `json:"soldOut"`
	Choices      []string      `json:"choices"`
	ComboChoices *ComboChoices `json:"comboChoices,omitempty"`
}

type ComboChoices struct {
	GroupID string `json:"groupId"`
	Label   string `json:"label"`
	Count   int    `json:"count"`
}

type OrderChoice struct {
	Label string      `json:"label"`
	Value interface{} `json:"value"`
	Price *float64    `json:"price,omitempty"`
}

type OrderItem struct {
	ID          string        `json:"id,omitempty"`
	ProductID   string        `json:"productId"`
	Name        string        `json:"name"`
	Choices     []OrderChoice `json:"choices"`
	ChoicesText string        `json:"choicesText"`
	UnitPrice   float64       `json:"unitPrice"`
	Quantity    int           `json:"quantity"`
}

type OrderHistoryEntry struct {
	Status    string    `json:"status"`
	Label     string    `json:"label"`
	Timestamp time.Time `json:"timestamp"`
}

type Order struct {
	ID              string              `json:"id"`
	Code            string              `json:"code"`
	CreatedAt       time.Time           `json:"createdAt"`
	UpdatedAt       time.Time           `json:"updatedAt"`
	Status          string              `json:"status"`
	History         []OrderHistoryEntry `json:"history"`
	CustomerName    string              `json:"customerName"`
	CustomerPhone   string              `json:"customerPhone"`
	OrderType       string              `json:"orderType"`
	PickupDate      string              `json:"pickupDate"`
	PickupTime      string              `json:"pickupTime"`
	PaymentMethod   string              `json:"paymentMethod"`
	CustomerAddress string              `json:"customerAddress"`
	CustomerNotes   string              `json:"customerNotes"`
	Items           []OrderItem         `json:"items"`
	Total           float64             `json:"total"`
}

type AdminSummary struct {
	TodayRevenue   float64 `json:"todayRevenue"`
	ActiveOrders   int     `json:"activeOrders"`
	CompletedToday int     `json:"completedToday"`
	AttentionItems int     `json:"attentionItems"`
}
