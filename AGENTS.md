# Project Agent Instructions

This project should evolve from a static food ordering site into a mobile-responsive ordering platform for Roast by Jaden.

## Required Technology Direction

- Frontend: Next.js
- Backend: Golang
- Database: Supabase Postgres, or plain Postgres if Supabase is not used in the target environment
- Deployment target can remain Vercel for the frontend, with the Go API deployed separately

Do not assume this project should remain a pure static HTML/CSS/JS site when planning new platform features.

## Architecture Intent

Use Next.js for:

- Customer ordering experience
- Mobile responsive web app or PWA
- Admin portal
- Order status screens
- Real-time UI updates

Use Golang for:

- Order APIs
- Menu and inventory APIs
- Admin control APIs
- Third-party API integrations
- Webhook handlers
- Delivery tracking integrations
- Background jobs and status synchronization

Use Postgres/Supabase for:

- Menu items
- Menu options and roast meat part selections
- Inventory and sold-out state
- Orders
- Order items
- Customer details
- Delivery tracking state
- Admin users and permissions

## Crucial Product Features

The platform must support:

- Food delivery tracking
- Third-party API integration
- Admin portal control
- Real-time food preparation status updates
- Real-time food availability and sold-out updates

## Real-Time Updates

Prefer a clear real-time strategy for customer and admin views. Acceptable options include:

- WebSockets from the Go backend
- Server-Sent Events from the Go backend
- Supabase Realtime for database-backed updates

Choose one intentionally and keep the data flow easy to reason about.

## Implementation Guidance

- Keep API keys, webhook secrets, and third-party credentials out of the frontend.
- Put third-party integration logic in the Go backend.
- Keep frontend components focused on display and user interaction.
- Keep business rules such as inventory deduction, order status transitions, and delivery state mapping in the backend.
- Preserve the existing ordering flow while migrating incrementally.
- Avoid large unrelated rewrites unless they are part of an agreed migration plan.

