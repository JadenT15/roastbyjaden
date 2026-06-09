package app

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Store struct {
	db *pgxpool.Pool
}

func NewStore(db *pgxpool.Pool) Store {
	return Store{db: db}
}

func (s Store) PublicState(ctx context.Context) (PublicState, error) {
	settings, err := s.Settings(ctx)
	if err != nil {
		return PublicState{}, err
	}
	groups, err := s.ChoiceGroups(ctx)
	if err != nil {
		return PublicState{}, err
	}
	products, err := s.Products(ctx)
	if err != nil {
		return PublicState{}, err
	}
	return PublicState{
		Settings:     settings,
		ChoiceGroups: groups,
		Products:     products,
		Orders:       []Order{},
		Session:      map[string]bool{"loggedIn": false},
	}, nil
}

func (s Store) Settings(ctx context.Context) (Settings, error) {
	var settings Settings
	err := s.db.QueryRow(ctx, "select ordering_open, business_open from settings where id = 1").
		Scan(&settings.OrderingOpen, &settings.BusinessOpen)
	return settings, err
}

func (s Store) ChoiceGroups(ctx context.Context) (map[string]ChoiceGroup, error) {
	rows, err := s.db.Query(ctx, `
		select g.id, g.label, o.id, o.value, o.available, o.price_override
		from choice_groups g
		left join choice_options o on o.group_id = g.id
		order by g.sort_order, o.sort_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	groups := map[string]ChoiceGroup{}
	for rows.Next() {
		var groupID, label string
		var optionID, value sql.NullString
		var available sql.NullBool
		var price sql.NullFloat64
		if err := rows.Scan(&groupID, &label, &optionID, &value, &available, &price); err != nil {
			return nil, err
		}
		group := groups[groupID]
		if group.ID == "" {
			group = ChoiceGroup{ID: groupID, Label: label, Options: []ChoiceOption{}}
		}
		if optionID.Valid {
			option := ChoiceOption{ID: optionID.String, Value: value.String, Available: available.Bool}
			if price.Valid {
				option.Price = &price.Float64
			}
			group.Options = append(group.Options, option)
		}
		groups[groupID] = group
	}
	return groups, rows.Err()
}

func (s Store) Products(ctx context.Context) ([]Product, error) {
	rows, err := s.db.Query(ctx, `
		select p.id, p.name, p.category, p.price, p.description, p.image_url, p.enabled, p.sold_out,
			coalesce(jsonb_agg(
				jsonb_build_object(
					'group_id', pcg.group_id,
					'combo_label', pcg.combo_label,
					'combo_count', pcg.combo_count,
					'sort_order', pcg.sort_order
				) order by pcg.sort_order
			) filter (where pcg.group_id is not null), '[]'::jsonb)
		from products p
		left join product_choice_groups pcg on pcg.product_id = p.id
		group by p.id
		order by p.sort_order, p.name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		var linksJSON []byte
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.Description, &p.Image, &p.Enabled, &p.SoldOut, &linksJSON); err != nil {
			return nil, err
		}
		var links []struct {
			GroupID    string `json:"group_id"`
			ComboLabel string `json:"combo_label"`
			ComboCount *int   `json:"combo_count"`
		}
		if err := json.Unmarshal(linksJSON, &links); err != nil {
			return nil, err
		}
		p.Choices = []string{}
		for _, link := range links {
			if link.ComboCount != nil {
				p.ComboChoices = &ComboChoices{GroupID: link.GroupID, Label: link.ComboLabel, Count: *link.ComboCount}
				continue
			}
			p.Choices = append(p.Choices, link.GroupID)
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func (s Store) LoginAdmin(ctx context.Context, email, password string) (tokenClaims, error) {
	var id, dbEmail, role, passwordHash string
	err := s.db.QueryRow(ctx, `
		select id::text, email, role, password_hash
		from admin_users
		where lower(email) = lower($1) and active = true`, strings.TrimSpace(email)).
		Scan(&id, &dbEmail, &role, &passwordHash)
	if err != nil {
		return tokenClaims{}, errors.New("invalid email or password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		return tokenClaims{}, errors.New("invalid email or password")
	}
	return tokenClaims{Sub: id, Email: dbEmail, Role: role, Exp: time.Now().Add(12 * time.Hour).Unix()}, nil
}

func (s Store) CreateOrder(ctx context.Context, input Order) (Order, error) {
	if input.OrderType == "Delivery" && strings.TrimSpace(input.CustomerAddress) == "" {
		return Order{}, errors.New("delivery address is required")
	}
	if len(input.Items) == 0 {
		return Order{}, errors.New("order must include at least one item")
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx)

	var orderingOpen bool
	if err := tx.QueryRow(ctx, "select ordering_open from settings where id = 1 for update").Scan(&orderingOpen); err != nil {
		return Order{}, err
	}
	if !orderingOpen {
		return Order{}, errors.New("ordering is paused")
	}

	var total float64
	for _, item := range input.Items {
		if item.Quantity <= 0 {
			return Order{}, errors.New("item quantity must be positive")
		}
		var enabled, soldOut bool
		if err := tx.QueryRow(ctx, "select enabled, sold_out from products where id = $1", item.ProductID).Scan(&enabled, &soldOut); err != nil {
			return Order{}, fmt.Errorf("product is unavailable: %s", item.ProductID)
		}
		if !enabled || soldOut {
			return Order{}, fmt.Errorf("product is sold out: %s", item.Name)
		}
		total += item.UnitPrice * float64(item.Quantity)
	}

	var order Order
	err = tx.QueryRow(ctx, `
		insert into orders (
			code, customer_name, customer_phone, order_type, pickup_date, pickup_time,
			payment_method, customer_address, customer_notes, total, status
		)
		values (
			'RBJ-' || lpad(nextval('order_code_seq')::text, 4, '0'),
			$1, $2, $3, $4, $5, $6, $7, $8, $9, 'NEW'
		)
		returning id::text, code, created_at, updated_at, status`,
		input.CustomerName, input.CustomerPhone, input.OrderType, input.PickupDate, input.PickupTime,
		input.PaymentMethod, input.CustomerAddress, input.CustomerNotes, total).
		Scan(&order.ID, &order.Code, &order.CreatedAt, &order.UpdatedAt, &order.Status)
	if err != nil {
		return Order{}, err
	}

	for _, item := range input.Items {
		choicesJSON, err := json.Marshal(item.Choices)
		if err != nil {
			return Order{}, err
		}
		if _, err := tx.Exec(ctx, `
			insert into order_items (order_id, product_id, product_name, choices, choices_text, unit_price, quantity)
			values ($1, $2, $3, $4, $5, $6, $7)`,
			order.ID, item.ProductID, item.Name, choicesJSON, item.ChoicesText, item.UnitPrice, item.Quantity); err != nil {
			return Order{}, err
		}
	}
	if _, err := tx.Exec(ctx, `
		insert into order_status_events (order_id, status, label)
		values ($1, 'NEW', 'Order placed')`, order.ID); err != nil {
		return Order{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Order{}, err
	}
	return s.OrderByCode(ctx, order.Code)
}

func (s Store) OrderByCode(ctx context.Context, code string) (Order, error) {
	return s.orderByWhere(ctx, "o.code = $1", strings.ToUpper(strings.TrimSpace(code)))
}

func (s Store) OrderByID(ctx context.Context, id string) (Order, error) {
	return s.orderByWhere(ctx, "o.id = $1", id)
}

func (s Store) orderByWhere(ctx context.Context, where string, value string) (Order, error) {
	var order Order
	err := s.db.QueryRow(ctx, `
		select o.id::text, o.code, o.created_at, o.updated_at, o.status, o.customer_name, o.customer_phone,
			o.order_type, o.pickup_date, o.pickup_time, o.payment_method, o.customer_address, o.customer_notes, o.total
		from orders o where `+where,
		value).Scan(&order.ID, &order.Code, &order.CreatedAt, &order.UpdatedAt, &order.Status, &order.CustomerName,
		&order.CustomerPhone, &order.OrderType, &order.PickupDate, &order.PickupTime, &order.PaymentMethod,
		&order.CustomerAddress, &order.CustomerNotes, &order.Total)
	if err != nil {
		return Order{}, err
	}
	items, err := s.orderItems(ctx, order.ID)
	if err != nil {
		return Order{}, err
	}
	history, err := s.orderHistory(ctx, order.ID)
	if err != nil {
		return Order{}, err
	}
	order.Items = items
	order.History = history
	return order, nil
}

func (s Store) orderItems(ctx context.Context, orderID string) ([]OrderItem, error) {
	rows, err := s.db.Query(ctx, `
		select id::text, product_id, product_name, choices, choices_text, unit_price, quantity
		from order_items where order_id = $1 order by created_at`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []OrderItem
	for rows.Next() {
		var item OrderItem
		var choicesJSON []byte
		if err := rows.Scan(&item.ID, &item.ProductID, &item.Name, &choicesJSON, &item.ChoicesText, &item.UnitPrice, &item.Quantity); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(choicesJSON, &item.Choices); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s Store) orderHistory(ctx context.Context, orderID string) ([]OrderHistoryEntry, error) {
	rows, err := s.db.Query(ctx, `
		select status, label, created_at from order_status_events
		where order_id = $1 order by created_at desc`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []OrderHistoryEntry
	for rows.Next() {
		var entry OrderHistoryEntry
		if err := rows.Scan(&entry.Status, &entry.Label, &entry.Timestamp); err != nil {
			return nil, err
		}
		history = append(history, entry)
	}
	return history, rows.Err()
}

func (s Store) TodayOrders(ctx context.Context) ([]Order, error) {
	rows, err := s.db.Query(ctx, `
		select id::text from orders
		where created_at >= ((timezone('Asia/Kuala_Lumpur', now())::date) at time zone 'Asia/Kuala_Lumpur')
		order by created_at desc`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		order, err := s.OrderByID(ctx, id)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	return orders, rows.Err()
}

func (s Store) AdminSummary(ctx context.Context) (AdminSummary, error) {
	orders, err := s.TodayOrders(ctx)
	if err != nil {
		return AdminSummary{}, err
	}
	products, err := s.Products(ctx)
	if err != nil {
		return AdminSummary{}, err
	}
	revenueStatuses := map[string]bool{"ACCEPTED": true, "PREPARING": true, "READY": true, "PACKING": true, "OUT_FOR_DELIVERY": true, "DONE": true}
	activeStatuses := map[string]bool{"NEW": true, "ACCEPTED": true, "PREPARING": true, "READY": true, "PACKING": true, "OUT_FOR_DELIVERY": true}

	var summary AdminSummary
	for _, order := range orders {
		if revenueStatuses[order.Status] {
			summary.TodayRevenue += order.Total
		}
		if activeStatuses[order.Status] {
			summary.ActiveOrders++
		}
		if order.Status == "DONE" {
			summary.CompletedToday++
		}
	}
	for _, product := range products {
		if product.SoldOut || !product.Enabled {
			summary.AttentionItems++
		}
	}
	return summary, nil
}

func (s Store) UpdateOrderStatus(ctx context.Context, orderID, status string) (Order, error) {
	if !OrderStatuses[status] {
		return Order{}, errors.New("invalid order status")
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx)

	result, err := tx.Exec(ctx, "update orders set status = $1, updated_at = now() where id = $2", status, orderID)
	if err != nil {
		return Order{}, err
	}
	if result.RowsAffected() == 0 {
		return Order{}, errors.New("order not found")
	}
	if _, err := tx.Exec(ctx, `
		insert into order_status_events (order_id, status, label)
		values ($1, $2, $3)`, orderID, status, "Seller updated order to "+status); err != nil {
		return Order{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Order{}, err
	}
	return s.OrderByID(ctx, orderID)
}

func (s Store) UpdateSettings(ctx context.Context, orderingOpen, businessOpen *bool) (Settings, error) {
	if _, err := s.db.Exec(ctx, `
		update settings
		set ordering_open = coalesce($1, ordering_open),
			business_open = coalesce($2, business_open),
			updated_at = now()
		where id = 1`, orderingOpen, businessOpen); err != nil {
		return Settings{}, err
	}
	return s.Settings(ctx)
}

func (s Store) UpdateProduct(ctx context.Context, productID string, enabled, soldOut *bool, price *float64, image *string) (Product, error) {
	if enabled != nil {
		if _, err := s.db.Exec(ctx, "update products set enabled = $1, updated_at = now() where id = $2", *enabled, productID); err != nil {
			return Product{}, err
		}
	}
	if soldOut != nil {
		if _, err := s.db.Exec(ctx, "update products set sold_out = $1, updated_at = now() where id = $2", *soldOut, productID); err != nil {
			return Product{}, err
		}
	}
	if price != nil {
		if *price < 0 {
			return Product{}, errors.New("price must be 0 or higher")
		}
		if _, err := s.db.Exec(ctx, "update products set price = $1, updated_at = now() where id = $2", *price, productID); err != nil {
			return Product{}, err
		}
	}
	if image != nil {
		nextImage := strings.TrimSpace(*image)
		if nextImage == "" {
			return Product{}, errors.New("image is required")
		}
		if len(nextImage) > 750000 {
			return Product{}, errors.New("image is too large")
		}
		if _, err := s.db.Exec(ctx, "update products set image_url = $1, updated_at = now() where id = $2", nextImage, productID); err != nil {
			return Product{}, err
		}
	}
	products, err := s.Products(ctx)
	if err != nil {
		return Product{}, err
	}
	for _, product := range products {
		if product.ID == productID {
			return product, nil
		}
	}
	return Product{}, errors.New("product not found")
}

func (s Store) UpdateOption(ctx context.Context, optionID string, available bool) (ChoiceOption, error) {
	var option ChoiceOption
	var price sql.NullFloat64
	err := s.db.QueryRow(ctx, `
		update choice_options set available = $1, updated_at = now() where id = $2
		returning id, value, available, price_override`, available, optionID).
		Scan(&option.ID, &option.Value, &option.Available, &price)
	if err != nil {
		return ChoiceOption{}, err
	}
	if price.Valid {
		option.Price = &price.Float64
	}
	return option, nil
}

func (s Store) AddProduct(ctx context.Context, product Product) (Product, error) {
	if strings.TrimSpace(product.ID) == "" {
		product.ID = slugify(product.Name)
	}
	if product.ID == "" {
		product.ID = "custom-product-" + fmt.Sprint(time.Now().Unix())
	}
	if product.Image == "" {
		product.Image = "https://images.pexels.com/photos/6645928/pexels-photo-6645928.jpeg?auto=compress&cs=tinysrgb&w=900"
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Product{}, err
	}
	defer tx.Rollback(ctx)
	if _, err := tx.Exec(ctx, `
		insert into products (id, name, category, price, description, image_url, enabled, sold_out)
		values ($1, $2, $3, $4, $5, $6, $7, $8)`,
		product.ID, product.Name, product.Category, product.Price, product.Description, product.Image, product.Enabled, product.SoldOut); err != nil {
		return Product{}, err
	}
	for index, groupID := range product.Choices {
		if _, err := tx.Exec(ctx, `
			insert into product_choice_groups (product_id, group_id, sort_order)
			values ($1, $2, $3)`, product.ID, groupID, index+1); err != nil {
			return Product{}, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return Product{}, err
	}
	return s.UpdateProduct(ctx, product.ID, nil, nil, nil, nil)
}

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var out strings.Builder
	lastDash := false
	for _, r := range value {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			out.WriteRune(r)
			lastDash = false
			continue
		}
		if !lastDash {
			out.WriteRune('-')
			lastDash = true
		}
	}
	return strings.Trim(out.String(), "-")
}
