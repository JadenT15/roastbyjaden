# n8n Payment Confirmation Setup

This setup lets n8n mark orders as paid after it reads a Touch 'n Go / DuitNow payment notification email.

## Backend setup

Add this environment variable to the deployed API:

```text
N8N_WEBHOOK_SECRET=make-a-long-random-secret-here
```

Run the latest `supabase/schema.sql` changes in Supabase so `orders` has:

- `payment_status`
- `payment_reference`
- `paid_at`

## n8n workflow shape

1. Gmail Trigger or IMAP Email Trigger
2. Extract order code from the email body or subject
3. Extract amount from the email body
4. HTTP Request to the website API

HTTP Request:

```text
POST https://roastbyjaden-seller-admin.vercel.app/api/webhooks/n8n/payment
```

Headers:

```text
Content-Type: application/json
X-N8N-Webhook-Secret: your N8N_WEBHOOK_SECRET value
```

Body:

```json
{
  "orderCode": "RBJ-1001",
  "amount": 12.9,
  "reference": "Touch n Go email notification",
  "paidAt": "2026-06-13T12:30:00+08:00",
  "source": "n8n-email"
}
```

`paidAt` is optional. If you send it, use RFC3339 format.

## Matching rules

- If `orderCode` exists and `amount` matches the order total, the order becomes `PAID`.
- If `orderCode` exists but `amount` does not match, the order becomes `PAYMENT_REVIEW`.
- If `orderCode` is missing from the email, n8n should not call the webhook automatically. Send it to manual review instead.

## Suggested email parsing

Look for:

- Order code: `RBJ-\d+`
- Amount: `RM ?([0-9]+(?:\.[0-9]{2})?)`

For best accuracy, ask customers to put the order code in the payment reference or remarks.
