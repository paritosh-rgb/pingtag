# PING / ParkPing

PING is the parent company. ParkPing is its first product: a privacy-first parking communication service. ParkPing prints physical QR stickers in advance, each with a permanent unique tag ID. A customer activates the delivered tag, attaches their vehicle details, and another person can scan it to send an anonymous alert without seeing the owner's phone number. Future products can follow the same Ping family, such as PetPing and BagPing. Owners also receive a private Civic Score equal to the number of times their active tag has been scanned. Run `supabase/private-chat.sql` on existing databases to enable anonymous alert conversations.

## MVP Flow

1. ParkPing prints a batch of physical tags with permanent IDs.
2. The customer signs up after ordering and receives the tag by delivery or email.
3. They enter the printed Tag ID and activate it against their vehicle.
4. They enable browser notifications and place the physical sticker on the windshield.
5. A scanner opens the QR URL without logging in and sends an anonymous alert.

Owners can view the recent ping history for each activated tag from the dashboard. The log contains the selected reason, anonymous message, timestamp, and whether browser delivery was available.

The public page shows the vehicle number and optional society/flat context. The phone number and address are never rendered there. Payment, fulfillment, email delivery, and warehouse tag inventory are the next integrations; the local MVP includes `npm run seed-tags 50` for test inventory.

## Run Locally

```bash
npm install
npm run dev
```

## Web Push Setup

Generate VAPID keys:

```bash
npm run vapid
```

Copy the generated values into `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:you@example.com
```

Restart the dev server after adding keys. Web Push works on `localhost` during development and requires HTTPS in production.

## Supabase Setup

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run `supabase/schema.sql` in the Supabase SQL editor. It creates `tags`, `vehicles`, and `alerts` with row-level security. For an existing project, also run `supabase/society-inventory.sql` to add society inventory assignments and refresh the public scanner view. Then run `supabase/phone-password.sql`. Keep Phone Auth disabled; email confirmation settings no longer matter. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` from Supabase Project Settings → API. This key is server-only and must never be exposed in browser code or committed. The UI collects only phone number and password; the server creates confirmed Supabase users without Twilio, OTP, or email signup rate limits.

Run `supabase/public-scanner.sql` as well. It creates the display-only view used by public QR scans; phone numbers and addresses are intentionally excluded.

Run `supabase/location-alerts.sql` to enable optional approximate scan locations. Scanners must explicitly opt in; coordinates are rounded before saving.

For a local activation test, run `supabase/seed-tags.sql` in the SQL editor. Production tag inventory should be inserted by an admin or fulfillment workflow, never from the public app. Assign bulk inventory tags to a society through the admin console; the society name is stored on `tags` and is inherited when a customer activates a tag. For local batches, run `npm run seed-tags 50 "Greenview Residency"`.

After adding or changing `.env.local`, restart the Next.js dev server and log in again. Supabase mode does not accept local fallback owner IDs.

## Notes

Without Supabase env vars, local development uses `data/store.json` for temporary owners, vehicles, subscriptions, and alerts. Production should use Supabase, add rate limiting and abuse controls, and move push delivery into a trusted server worker with a VAPID private key.
