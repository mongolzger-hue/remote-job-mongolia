# Membership operations

Initial plan: MNT 10,000 for 30 days, one-time bank transfer, no automatic renewal. QPay is not integrated. An administrator must compare the transfer against the actual bank statement before approving an order. Approval extends access from the later of the current expiry or approval time. Duplicate approval cannot extend access twice.

Migration 007 was applied to the configured Supabase project. Public registration remains disabled (`MEMBER_SIGNUP_ENABLED` defaults to false). Payments remain disabled in `membership_settings`.

Before opening registration:

1. Configure custom SMTP in Supabase Auth; its default mail service is not suitable for public signup.
2. Set the production Auth site URL and allow the site's `/auth/callback` redirect.
3. Verify confirmation and password-reset emails with an actual consenting account.
4. Set `MEMBER_SIGNUP_ENABLED=true` in Vercel Production and redeploy.

Before taking payments:

1. Set a public `SUPPORT_EMAIL` in Production and redeploy.
2. Publish at least one real original listing offering membership application access. Imported feed listings always remain free.
3. In `/admin/memberships`, enter the receiving bank, account number, account holder, price, duration and approved refund terms; then enable payments.
4. Verify a real transfer and the complete customer flow before announcing payments as available.

Application links for original members-only listings pass through `/apply/[id]` and require a verified account with unexpired membership. This controls access on this board; it cannot restrict an employer's independently public website.

Validation performed: 29 unit tests and production build passed. The opt-in `scripts/test-membership-integration.mjs` passed with disposable accounts, then removed them: private login cookies, account ownership, saved-job isolation, imported free application redirect, disabled-payment guard, admin authorization, atomic review, renewal and table RLS. No email or money was sent. Real SMTP delivery, customer signup/reset, original paid application flow and real bank-payment review still require operational testing.

Existing job backups cover jobs; they are not complete backups of authentication or membership records. Arrange database backups before taking customer payments.
