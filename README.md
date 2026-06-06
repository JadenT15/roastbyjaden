# Roast by Jaden Ordering MVP

This project now includes:

- a customer website at `index.html`
- a separate seller admin portal at `admin/index.html`
- shared browser-based MVP state for demo and flow testing

## Start and deploy guide

For the simplest non-technical guide, read:

- `docs/simple-start-and-deploy-guide.md`

## Important current limitation

This version is still a browser-only MVP.

That means customer and admin data are not yet shared across different devices or different domains in a real production way.

For a true live system, the next step is:

- Next.js frontend
- Go backend
- Postgres or Supabase database

## Current project status

- Current app: static HTML, CSS, and JavaScript.
- Current customer flow: browser-backed cart, order creation, WhatsApp handoff, and order tracking.
- Current seller flow: separate admin portal for menu availability and order status.
- Current deployment: static Vercel site with no build command.
- Planned frontend: Next.js App Router with TypeScript.
- Planned backend direction: Go API with Supabase Postgres or plain Postgres.

## Start the current static site

This version does not need dependency installation.

1. Open `index.html` directly in a browser.
2. Or serve the folder with any static file server.
3. Test the flow by adding menu items, updating quantities, filling the order form, and checking the seller portal.

If you use a local static server, run it from the repository root so `assets/xianzai-hero.jpg`, `styles.css`, `app.js`, and `shared/platform-store.js` resolve correctly.

## Edit business details

Update `shared/platform-store.js` for:

- `business.name`
- `business.whatsappNumber`
- Menu item names, categories, prices, descriptions, images, and sold-out states
- Roast meat choice groups

Update `index.html` for:

- Business name and page copy
- Opening hours
- Service type
- Payment options
- Pickup address
- Contact link

Update `assets/` when replacing local images. Some external menu images are currently referenced from `shared/platform-store.js`.

## Required setup for Next.js migration

Before starting the Next.js migration, confirm the local environment has:

- Node.js
- A package manager such as npm or pnpm
- Git
- A Vercel account or project for deployment testing

Expected commands after migration:

```bash
npm install
npm run dev
npm run build
npm run start
```

If pnpm is selected instead, use the equivalent `pnpm install`, `pnpm dev`, `pnpm build`, and `pnpm start` commands.

## Deploy on Vercel

### Current static version

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Keep the default static-site settings.
4. Deploy with no build command.

### Future Next.js version

1. Push the Next.js project to GitHub.
2. Import or reconnect the repository in Vercel.
3. Use the Next.js framework preset.
4. Build command should be the package script, usually `npm run build`.
5. Output handling should be managed by Vercel's Next.js preset.

## Planning references

- `docs/admin-platform-flow.md`
- `docs/order-flowcharts.md`
- Startup and required specs: `docs/startup-spec.md`
