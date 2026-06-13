package app

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type Server struct {
	cfg   Config
	store Store
}

func NewServer(cfg Config, store Store) Server {
	return Server{cfg: cfg, store: store}
}

func (s Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", s.handleHealth)
	mux.HandleFunc("/api/menu", s.handleMenu)
	mux.HandleFunc("/api/settings", s.handleSettings)
	mux.HandleFunc("/api/orders", s.handleOrders)
	mux.HandleFunc("/api/orders/", s.handleOrderByCode)
	mux.HandleFunc("/api/webhooks/n8n/payment", s.handleN8NPaymentWebhook)
	mux.HandleFunc("/api/admin/login", s.handleAdminLogin)
	mux.HandleFunc("/api/admin/logout", s.withAdmin(s.handleAdminLogout))
	mux.HandleFunc("/api/admin/me", s.withAdmin(s.handleAdminMe))
	mux.HandleFunc("/api/admin/summary", s.withAdmin(s.handleAdminSummary))
	mux.HandleFunc("/api/admin/orders", s.withAdmin(s.handleAdminOrders))
	mux.HandleFunc("/api/admin/orders/", s.withAdmin(s.handleAdminOrderByID))
	mux.HandleFunc("/api/admin/settings", s.withAdmin(s.handleAdminSettings))
	mux.HandleFunc("/api/admin/products", s.withAdmin(s.handleAdminProducts))
	mux.HandleFunc("/api/admin/products/", s.withAdmin(s.handleAdminProductByID))
	mux.HandleFunc("/api/admin/options/", s.withAdmin(s.handleAdminOptionByID))
	return s.withCORS(mux)
}

func (s Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if s.isAllowedOrigin(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s Server) isAllowedOrigin(origin string) bool {
	if origin == "" {
		return false
	}
	for _, candidate := range strings.Split(s.cfg.FrontendOrigin, ",") {
		if origin == strings.TrimSpace(candidate) {
			return true
		}
	}
	switch origin {
	case "https://roastbyjaden.vercel.app",
		"https://roastbyjaden-seller-admin.vercel.app",
		"http://127.0.0.1:4173",
		"http://127.0.0.1:4175":
		return true
	default:
		return false
	}
}

func (s Server) withAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if _, err := readAuthClaims(r, s.cfg); err != nil {
			writeError(w, http.StatusUnauthorized, "Please log in again.")
			return
		}
		next(w, r)
	}
}

func (s Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s Server) handleMenu(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	state, err := s.store.PublicState(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load menu.")
		return
	}
	writeJSON(w, http.StatusOK, state)
}

func (s Server) handleSettings(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	settings, err := s.store.Settings(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load settings.")
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (s Server) handleOrders(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	var input Order
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Order details are invalid.")
		return
	}
	order, err := s.store.CreateOrder(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, order)
}

func (s Server) handleOrderByCode(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	code := strings.TrimPrefix(r.URL.Path, "/api/orders/")
	order, err := s.store.OrderByCode(r.Context(), code)
	if err != nil {
		writeError(w, http.StatusNotFound, "Order not found.")
		return
	}
	writeJSON(w, http.StatusOK, order)
}

func (s Server) handleAdminLogin(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Login details are invalid.")
		return
	}
	claims, err := s.store.LoginAdmin(r.Context(), input.Email, input.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "Login failed.")
		return
	}
	token, err := signToken(s.cfg.JWTSecret, claims)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create session.")
		return
	}
	setAuthCookie(w, s.cfg, token)
	writeJSON(w, http.StatusOK, map[string]interface{}{"email": claims.Email, "role": claims.Role})
}

func (s Server) handleAdminLogout(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	clearAuthCookie(w, s.cfg)
	writeJSON(w, http.StatusOK, map[string]bool{"loggedOut": true})
}

func (s Server) handleAdminMe(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	claims, err := readAuthClaims(r, s.cfg)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "Please log in again.")
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"email": claims.Email, "role": claims.Role})
}

func (s Server) handleAdminSummary(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	summary, err := s.store.AdminSummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load summary.")
		return
	}
	writeJSON(w, http.StatusOK, summary)
}

func (s Server) handleAdminOrders(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	orders, err := s.store.TodayOrders(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load orders.")
		return
	}
	writeJSON(w, http.StatusOK, orders)
}

func (s Server) handleAdminOrderByID(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPatch) {
		return
	}
	orderID, suffix := splitNestedPath(strings.TrimPrefix(r.URL.Path, "/api/admin/orders/"))
	if suffix == "payment" {
		var input struct {
			PaymentStatus    string `json:"paymentStatus"`
			PaymentReference string `json:"paymentReference"`
		}
		if err := readJSON(r, &input); err != nil {
			writeError(w, http.StatusBadRequest, "Payment status is invalid.")
			return
		}
		order, err := s.store.UpdateOrderPaymentStatus(r.Context(), orderID, input.PaymentStatus, input.PaymentReference)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, order)
		return
	}
	if suffix != "status" {
		writeError(w, http.StatusNotFound, "Admin order route not found.")
		return
	}
	var input struct {
		Status string `json:"status"`
	}
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Status is invalid.")
		return
	}
	order, err := s.store.UpdateOrderStatus(r.Context(), orderID, input.Status)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, order)
}

func (s Server) handleN8NPaymentWebhook(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	if s.cfg.N8NWebhookSecret == "" {
		writeError(w, http.StatusServiceUnavailable, "Payment webhook is not configured.")
		return
	}
	secret := r.Header.Get("X-N8N-Webhook-Secret")
	if secret == "" && strings.HasPrefix(r.Header.Get("Authorization"), "Bearer ") {
		secret = strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	}
	if subtle.ConstantTimeCompare([]byte(secret), []byte(s.cfg.N8NWebhookSecret)) != 1 {
		writeError(w, http.StatusUnauthorized, "Webhook secret is invalid.")
		return
	}
	var input struct {
		OrderCode string  `json:"orderCode"`
		Amount    float64 `json:"amount"`
		Reference string  `json:"reference"`
		PaidAt    string  `json:"paidAt"`
		Source    string  `json:"source"`
	}
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Payment details are invalid.")
		return
	}
	if strings.TrimSpace(input.OrderCode) == "" || input.Amount <= 0 {
		writeError(w, http.StatusBadRequest, "Order code and amount are required.")
		return
	}
	var paidAt *time.Time
	if strings.TrimSpace(input.PaidAt) != "" {
		parsed, err := time.Parse(time.RFC3339, input.PaidAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "Paid time must be RFC3339 format.")
			return
		}
		paidAt = &parsed
	}
	reference := strings.TrimSpace(input.Reference)
	if input.Source != "" {
		reference = strings.TrimSpace(reference + " " + input.Source)
	}
	order, err := s.store.ConfirmPaymentByCode(r.Context(), input.OrderCode, input.Amount, reference, paidAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, order)
}

func (s Server) handleAdminSettings(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPatch) {
		return
	}
	var input struct {
		OrderingOpen *bool `json:"orderingOpen"`
		BusinessOpen *bool `json:"businessOpen"`
	}
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Settings are invalid.")
		return
	}
	settings, err := s.store.UpdateSettings(r.Context(), input.OrderingOpen, input.BusinessOpen)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update settings.")
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (s Server) handleAdminProducts(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	var input Product
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Product details are invalid.")
		return
	}
	product, err := s.store.AddProduct(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, product)
}

func (s Server) handleAdminProductByID(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPatch) {
		return
	}
	productID := strings.TrimPrefix(r.URL.Path, "/api/admin/products/")
	var input struct {
		Enabled *bool `json:"enabled"`
		SoldOut *bool `json:"soldOut"`
		Price   *float64 `json:"price"`
		Image   *string `json:"image"`
	}
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Product update is invalid.")
		return
	}
	product, err := s.store.UpdateProduct(r.Context(), productID, input.Enabled, input.SoldOut, input.Price, input.Image)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, product)
}

func (s Server) handleAdminOptionByID(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPatch) {
		return
	}
	optionID := strings.TrimPrefix(r.URL.Path, "/api/admin/options/")
	var input struct {
		Available bool `json:"available"`
	}
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "Option update is invalid.")
		return
	}
	option, err := s.store.UpdateOption(r.Context(), optionID, input.Available)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, option)
}

func splitNestedPath(path string) (string, string) {
	parts := strings.SplitN(strings.Trim(path, "/"), "/", 2)
	if len(parts) == 1 {
		return parts[0], ""
	}
	return parts[0], parts[1]
}

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed.")
		return false
	}
	return true
}

func readJSON(r *http.Request, output interface{}) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(output); err != nil {
		return err
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	if message == "" {
		message = "Something went wrong."
	}
	writeJSON(w, status, map[string]string{"error": message})
}
