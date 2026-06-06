# Roast by Jaden Admin Platform Flow

## Purpose

This file is an agent-facing handoff reference for future Roast by Jaden platform work. Read it before planning or implementing customer ordering, seller admin, product availability, delivery tracking, real-time updates, or backend/database features.

The project should evolve from the current static ordering site into a mobile-responsive food delivery and ordering platform for 香港烧腊饭. Preserve the existing customer ordering flow while migrating incrementally.

## Current State

- The current customer site is static: `index.html`, `styles.css`, and `app.js`.
- Menu data, prices, categories, images, and sold-out option data are hardcoded in `app.js`.
- Checkout currently builds a WhatsApp message and opens `wa.me`; WhatsApp is not the future source of truth for orders.
- The current menu categories are:
  - `烧味饭`
  - `双拼/拼盘`
  - `单点加料`
- The current option groups are:
  - `鸡肉部位`: `鸡胸`, `鸡二度`, `鸡翅`, `鸡腿`
  - `叉烧肥瘦`: `瘦`, `半肥瘦`
  - `重量`: `100g`, `200g`
  - `烧鸭规格`: `一例`, `半只`, `一只`

Future work must treat both products and option values as availability-controlled records. For example, a whole item can be disabled, and a specific choice like `鸡腿` or `半肥瘦` can also be sold out.

## Target Stack

- Frontend: Next.js
  - Customer ordering portal
  - Mobile responsive web app or PWA
  - Seller admin portal
  - Customer order status page
  - Real-time customer and admin UI updates
- Backend: Go
  - Admin login and protected APIs
  - Menu, product, inventory, and order APIs
  - Food preparation and delivery status control
  - Server-Sent Events for real-time updates
  - Third-party API integrations and webhook handlers
  - Business rules and background jobs
- Database: Supabase Postgres or plain Postgres
  - Products and menu options
  - Inventory and sold-out state
  - Orders and order items
  - Customer details
  - Delivery tracking state
  - Admin users and permissions
  - Order status history

## Chosen Defaults

- Migration path: Platform MVP.
- Real-time strategy: Go Server-Sent Events.
- Admin auth: Go JWT login with secure HTTP-only cookies.
- Delivery tracking v1: manual seller-controlled statuses.
- Admin UI language: bilingual, with English operational labels and Chinese product names preserved.

## Target Admin Features

- Seller login.
- Enable, disable, or mark a product as sold out.
- Enable or disable option-level availability, such as roast meat parts and portion choices.
- Add new products to the customer portal.
- Show total earning of the day.
- Control order and food status:
  - `NEW`
  - `ACCEPTED`
  - `PREPARING`
  - `READY`
  - `OUT_FOR_DELIVERY`
  - `DONE`
  - `CANCELLED`

## Customer Ordering Flow

```mermaid
flowchart TD
    A["Customer opens Next.js customer portal"] --> B["Go API returns active menu from Postgres"]
    B --> C["Customer browses categories: 烧味饭, 双拼/拼盘, 单点加料"]
    C --> D{"Product enabled and not sold out?"}
    D -->|"No"| E["Show Sold Out or hide from purchasable actions"]
    D -->|"Yes"| F{"Product has option groups?"}
    F -->|"No"| G["Customer adds item to cart"]
    F -->|"Yes"| H["Customer selects available options, such as 鸡腿 or 半肥瘦"]
    H --> I{"Selected option available?"}
    I -->|"No"| J["Disable choice and show Sold Out"]
    I -->|"Yes"| G
    G --> K["Customer enters name, phone, order type, delivery address, time, payment method, notes"]
    K --> L["Customer submits order to Go API"]
    L --> M["Go validates menu availability and creates order in Postgres"]
    M --> N["Go emits SSE event to admin dashboard"]
    M --> O["Customer sees order tracking page with public order code"]
```

## Admin Product And Inventory Flow

```mermaid
flowchart TD
    A["Seller logs in to admin portal"] --> B["Next.js calls Go admin APIs with JWT cookie"]
    B --> C["Seller opens product and availability screen"]
    C --> D{"Seller action"}
    D -->|"Enable or disable product"| E["Go updates product status in Postgres"]
    D -->|"Mark product sold out"| F["Go updates product sold-out state in Postgres"]
    D -->|"Enable or disable option value"| G["Go updates option availability, such as 鸡翅 or 100g"]
    D -->|"Add new product"| H["Go creates product, category, price, image, and option links"]
    E --> I["Go publishes product availability SSE event"]
    F --> I
    G --> I
    H --> I
    I --> J["Customer menu updates in real time"]
    I --> K["Admin screens update in real time"]
```

## Admin Order Status Flow

```mermaid
flowchart TD
    A["New order enters Postgres"] --> B["Admin dashboard receives SSE event"]
    B --> C["Seller reviews order details and payment method"]
    C --> D{"Accept order?"}
    D -->|"No"| E["Set status CANCELLED"]
    D -->|"Yes"| F["Set status ACCEPTED"]
    F --> G["Backend deducts inventory or reserves selected option quantities"]
    G --> H["Set status PREPARING"]
    H --> I{"Pickup or delivery?"}
    I -->|"Pickup"| J["Set status READY"]
    J --> K["Customer collects food"]
    K --> L["Set status DONE"]
    I -->|"Delivery"| M["Set status READY"]
    M --> N["Set status OUT_FOR_DELIVERY"]
    N --> O["Food delivered"]
    O --> L
    E --> P["Go emits order status SSE event"]
    L --> P
    H --> P
    N --> P
    P --> Q["Customer tracking page updates"]
    P --> R["Admin order board updates"]
```

## Go SSE Real-Time Update Flow

```mermaid
flowchart TD
    A["Customer page or admin page opens"] --> B["Browser connects to Go SSE endpoint"]
    B --> C["Go registers connection for product or order stream"]
    D["Admin changes product or order status"] --> E["Go validates request and writes Postgres transaction"]
    E --> F["Go publishes domain event in memory or through a small event bus"]
    F --> G["Go sends SSE message to connected browsers"]
    G --> H["Next.js client updates menu, order board, earnings, or tracking UI"]
    E --> I["Postgres remains source of truth"]
```

Use Go API writes as the primary event source. If future tools update Postgres outside the Go API, add Postgres `LISTEN/NOTIFY` or a lightweight polling worker so Go can still publish SSE events.

## Suggested Backend And Database Flow

```mermaid
flowchart LR
    A["Next.js customer portal"] --> B["Go public APIs"]
    C["Next.js admin portal"] --> D["Go admin APIs"]
    B --> E["Postgres"]
    D --> E
    D --> F["Business rules: auth, status transitions, inventory deduction"]
    F --> E
    F --> G["SSE publisher"]
    G --> A
    G --> C
    D --> H["Third-party integrations and webhooks"]
    H --> E
```

Suggested records:

- `admin_users`: seller/admin identity, password hash, role, active state.
- `products`: menu item name, category, description, price, image, enabled state, sold-out state.
- `product_option_groups`: reusable groups such as `鸡肉部位`, `叉烧肥瘦`, `重量`, `烧鸭规格`.
- `product_option_values`: option labels, optional override price, availability, sort order.
- `product_option_links`: product-to-option-group mapping.
- `orders`: customer details, order type, delivery address, payment method, total, current status, public tracking code.
- `order_items`: ordered product snapshot, selected options snapshot, unit price, quantity.
- `order_status_events`: status history, actor, timestamp, optional note.
- `inventory_adjustments`: optional future stock history for roast parts and product availability.

## Implementation Notes For Future Agents

- Keep API keys, webhook secrets, payment credentials, delivery credentials, and WhatsApp credentials out of the frontend.
- Put third-party integration logic in the Go backend.
- Keep frontend components focused on display and user interaction.
- Keep business rules in Go, especially inventory deduction, product availability checks, order status transitions, earnings calculations, and delivery state mapping.
- Preserve the existing ordering flow while migrating: menu browsing, cart, customer details, pickup or delivery time, payment method, and notes should still feel familiar.
- Use Go SSE as the chosen real-time strategy for customer tracking, admin order updates, earnings refreshes, and product sold-out updates.
- Treat Postgres as the source of truth. WhatsApp can remain as an optional notification channel, but not the canonical order store.
- Calculate today's earnings using Asia/Kuala_Lumpur business-day boundaries.
- Default earnings calculation should include `ACCEPTED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, and `DONE`; exclude `NEW` and `CANCELLED`.

## Suggested Add-On Features

- Low-stock alerts for popular roast parts.
- Pause ordering toggle for closing early.
- Time-slot capacity limits to avoid too many orders in one pickup or delivery window.
- WhatsApp notification from Go backend after order submission or status changes.
- Customer order tracking link after checkout.
- Daily sales breakdown by product.
- Kitchen screen focused only on active preparation orders.
- Admin audit log for product and status changes.
