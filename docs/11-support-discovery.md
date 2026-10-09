# Support discovery and launch checks

Targeted Himalayas searches query country MN, recent sort, and customer support, customer service, virtual assistant, administrative assistant and content moderator. Search pages are cached locally for 24 hours. Repeat with `node --conditions=react-server --import tsx scripts/import-support.ts`. Existing source attribution, expiration and Mongolia eligibility screening remain in force. Full-text source matches may include related roles, so the site's title-based collections narrow the results.

2026-10-09 result after auditing region conflicts and non-job talent pools: 428 public listings (previously 275), 69 support listings, 23 support listings explicitly mentioning English, 18 assistant/data-entry/moderator listings and 6 listings with entry-level evidence. These are counts, not a guarantee of employer acceptance, easy work, English-only requirements or no experience needed. Collections retain other language and schedule details in the original descriptions.

Classification gives explicit role titles precedence over broad source categories. EMEA/LATAM/Europe restrictions, localized hiring locations and incomplete location placeholders require review. Spontaneous applications, RFPs and general team-application pools are excluded.

Membership selection: imported application links remain free; only original employer listings can require membership. No original listings currently exist, so the Membership collection is empty and payments remain closed. Do not copy an imported job into an original record to bypass this rule. Admin edits already allow member-only access only on original records.

Public support contact supplied by the owner: latentlab43@gmail.com. It is configured in Production and shown on membership/privacy pages. It is not an SMTP credential.

Checks passed: 37 unit tests, production build, isolated Wire HTTP transport tests (amount units, sandbox routing, idempotency keys, checkout binding, error responses and unsafe redirects) and production member integration (login, private cookies, saved-job ownership, public imported apply, closed-payment guard, admin-only review, atomic review, renewal, RLS and logout). Disposable accounts were removed; no email or money was sent. Wire webhook had already passed a real signed endpoint verification ping.

Remaining operator actions: enable Google 2-Step Verification and obtain an app password if that account permits it, configure Supabase custom SMTP and redirect URLs, verify consenting-user signup and password-reset delivery, approve refund terms, acquire original member-only listings, then complete an owner-performed real payment test. A Wire test key is not available in the observed dashboard; no real payment success has been tested.
