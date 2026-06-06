# Roast by Jaden Simple Start and Deploy Guide

## Read This First

This current version is a simple browser-based MVP.

That means:

- It works well for demo, testing, and showing the flow.
- Customer page and admin page share data only inside the same browser on the same device.
- It is **not yet a real live multi-device system**.
- If a customer opens the client site on their phone and the seller opens the admin site on another device, they will **not** see the same orders yet.

Why?

- Right now the data is saved in the browser only.
- There is no real backend or shared database yet.

So for now, use this version for:

- demo
- layout review
- flow testing
- seller feature preview

Do **not** use this current version for real public ordering yet.

## What Opens What

- Customer website: `index.html`
- Admin website: `admin/index.html`
- Seller login:
  - Email: `seller@roastbyjaden.local`
  - Password: `jaden123`

## Simplest Way To Start It On Your Computer

### Step 1

Open the project folder in Terminal.

### Step 2

Run this command:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

### Step 3

Open these links in your browser:

- Customer: `http://127.0.0.1:4173/index.html`
- Admin: `http://127.0.0.1:4173/admin/index.html`

### Step 4

Keep that Terminal window open while you are using the site.

If you close the Terminal window, the local website stops.

## How To Use It

### Customer side

1. Open the customer link.
2. Add food into cart.
3. Fill in name, phone, and order details.
4. Press `Place order`.
5. You will get an order code like `RBJ-1001`.
6. Use that code in the tracking section.

### Admin side

1. Open the admin link.
2. Log in with the seller email and password above.
3. You can:
   - pause ordering
   - enable or disable products
   - mark products sold out
   - change roast part option availability
   - add new products
   - update order status
   - see today's revenue

## Easiest Vercel Setup Right Now

For the current MVP, the easiest online setup is:

- deploy **one** Vercel project
- use the customer page as the main website
- use `/admin/` as the seller page

Example:

- Customer: `https://your-client-site.vercel.app/`
- Admin: `https://your-client-site.vercel.app/admin/`

This is the simplest because both pages stay under the same deployed site.

## Can I Deploy Customer And Admin As Two Separate Vercel Websites Right Now?

Short answer: **not properly, not with the current browser-only MVP**.

There are two reasons:

### Reason 1

The current app saves data in the browser only.

So if customer and admin are on different websites or different devices, they will not share the same orders or product status.

### Reason 2

The admin page currently uses shared files from the main project.

So it is not yet a fully independent deployable app by itself.

## Best Recommendation Right Now

### If you want something usable today

Deploy only the main site to Vercel, and open admin from:

`your-domain.com/admin/`

### If you want two real websites later

Build the next version with:

- Next.js frontend
- Go backend
- Postgres or Supabase

Then deploy:

- customer site to the client domain
- admin site to a separate admin domain
- both connected to the same backend and database

## How To Deploy The Current MVP To Vercel

### Step 1

Push this project to GitHub.

### Step 2

Log in to Vercel.

### Step 3

Create a new project and import this GitHub repository.

### Step 4

For this current static version:

- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty
- Root Directory: project root

### Step 5

Press `Deploy`.

After deploy:

- customer page opens from the main domain
- admin page is at `/admin/`

## How To Put It On Your Existing Client Website

If your client website already exists on Vercel:

1. connect this repository to that Vercel project, or
2. create a new Vercel project and later point the existing domain to it

After deployment, the URLs will look like:

- Client homepage: `https://your-client-domain.com/`
- Admin page: `https://your-client-domain.com/admin/`

## How To Create An Admin Website Later

When you are ready for a real separate admin website, the better setup is:

- Customer domain: `www.yourdomain.com`
- Admin domain: `admin.yourdomain.com`

But do this only after the project has:

- real backend
- real database
- shared login
- shared orders
- shared product data

## Simple Next Step

The best next technical step is to move this MVP from browser-only storage into a real backend so:

- customers can place real orders
- seller can log in from another device
- admin and client can live on separate domains
- Vercel deployment becomes clean for both websites
