# Startup And Required Specs

This document lists the configuration and specs needed to start the current site, migrate it to Next.js, and prepare for later backend/admin work.

## Current Startup Requirements

The current app is a static site. It can run without installing dependencies.

Required:

- A web browser
- Git, if contributing changes
- Access to the repository files

Optional:

- Any static file server for local testing
- Vercel account for deployment

Open `index.html` directly or serve the repository root. Make sure these files are available from the same root:

- `index.html`
- `styles.css`
- `app.js`
- `assets/xianzai-hero.jpg`

## Required Business Configuration

Confirm these details before launch or migration:

- Brand name: customer-facing restaurant name.
- WhatsApp number: international format without `+`, for example `60123456789`.
- Service hours: opening and closing times shown to customers.
- Pickup address: exact customer pickup point.
- Service options: pickup, delivery, or both.
- Payment options: cash, QR, bank transfer, or other accepted methods.
- Menu categories: for example `烧味饭`, `双拼/拼盘`, and `单点加料`.
- Menu items: id, name, category, price, description, image, and available choices.
- Choice groups: roast meat part selections such as chicken part or char siu fat level.
- Sold-out states: which items or choices should be disabled.
- Contact link: WhatsApp or other contact destination.
- Images: local hero image plus any remote or local menu item images.

WhatsApp checkout is safe to keep as public frontend configuration for now because customers need the contact number to place orders. Do not put private API keys, webhook secrets, delivery-provider tokens, database credentials, or admin credentials in frontend files.

## Next.js Migration Specs

The first Next.js migration should preserve the existing customer flow and avoid adding backend scope.

Required frontend specs:

- Use Next.js App Router.
- Use TypeScript.
- Keep the customer route at `/`.
- Preserve the current visual design with global CSS.
- Move local images into `public/assets`.
- Keep menu and business data in typed data modules.
- Use a client component for interactive ordering behavior.
- Keep cart state client-side for this migration.
- Preserve category filtering, choice selection, sold-out disabling, quantity controls, totals, and mobile checkout bar.
- Preserve WhatsApp checkout with encoded order text.
- Include scripts for local development, production build, production start, and linting.

Required local tools for migration:

- Node.js
- npm or pnpm
- Git
- Vercel account or project access for deployment testing

Planning note: this environment had Node.js available, but npm/pnpm was not visible from the shell. Fix package-manager availability before installing Next.js dependencies or running build verification.

## Future Platform Specs To Collect

Collect these before starting backend, database, admin, delivery, or real-time work:

- Go API endpoints for menu, inventory, orders, admin actions, webhooks, and delivery tracking.
- Database choice: Supabase Postgres or plain Postgres.
- Data model for menu items, option groups, inventory, orders, customers, delivery status, and admin users.
- Inventory rules, including when stock is deducted and how sold-out states sync to customers.
- Order status lifecycle, such as received, confirmed, preparing, ready, out for delivery, completed, cancelled, and refunded.
- Admin roles and permissions.
- Real-time update strategy: Go WebSockets, Go Server-Sent Events, or Supabase Realtime.
- Delivery provider and tracking API requirements.
- Third-party API credentials and webhook secrets.
- Payment confirmation flow, if payment moves beyond manual cash, QR, or transfer confirmation.

Backend and database specs are not required for the first Next.js frontend migration. Keep third-party integration logic and private credentials in the backend when that work begins.

## Documentation Maintenance

After the Next.js migration is complete:

- Replace static startup instructions in `README.md` with verified Next.js commands.
- Keep this file as the source of truth for setup requirements and future platform specs.
- Update deployment notes after the first successful Vercel Next.js deployment.
