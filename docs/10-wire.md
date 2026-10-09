# Wire integration

Code provides hosted checkout, authenticated payment reconciliation and a signed webhook. It uses only https://api.wire.mn/v1 and redirects only to https://pay.wire.mn/c/. Amounts are stored in tugrik and multiplied by 100 for Wire minor units. Price and duration come from the server's plan; client amounts are ignored.

Migration 008 was applied to the configured database. Atomic settlement locks the order and returns the existing expiry on repeated delivery. Existing bank orders remain supported; the admin bank-review endpoint cannot approve Wire orders.

Server secrets: WIRE_API_KEY, WIRE_WEBHOOK_SECRET. Never use NEXT_PUBLIC prefixes. Configure WIRE_MODE=test initially. WIRE_PAYMENTS_ENABLED defaults to false. Test mode requires an sk_test key and sandbox operator. Test success never grants real membership. Live mode requires an sk_live key and WIRE_OPERATORS set to actual enabled operator IDs from the Wire dashboard; also public registration, support contact, refund terms and original paid listings must be ready.

Webhook URL: https://remote-job-mongolia-1gys.vercel.app/api/webhooks/wire

Register it in Wire with payment_intent.succeeded events, store its signing secret in server environment, redeploy, then run Wire endpoint verification. Signature checks use raw body, HMAC SHA256, timing-safe comparison and a 300-second window. Configure a trusted Vercel firewall rule for Wire's documented source IP if available; request headers alone are not a trusted IP check. The handler also retrieves the intent from Wire and matches order ID, stored intent, amount, currency, mode and succeeded status. Success redirects alone never grant access. Without webhook delivery the signed-in customer can use Check payment to reconcile.

Order creation retries reuse persistent order and provider idempotency keys. Never blindly discard a failed/old checkout: check the provider status first. Canceled payments free the pending slot on reconciliation. Creation older than 47 hours requires support reconciliation instead of reusing Wire's 48-hour idempotency window. API timeouts retain pending records for retry.

Validation: 33 unit tests and production build passed. The supplied live key passed read-only authentication (HTTP 200); no invoice or money was created. A disposable database test also verified mismatched intent rejection and concurrent duplicate settlement granting only one 30-day term. Real Wire checkout tests remain pending: no test key has been supplied. Do not enable live payments until an end-to-end sandbox test and operational prerequisites are complete. No money was transferred.

Official references: https://docs.wire.mn/docs/quickstart , https://docs.wire.mn/docs/guides/webhooks , https://docs.wire.mn/docs/concepts/money-and-time
