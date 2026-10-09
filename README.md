# Remote Job Mongolia

Next.js, TypeScript, Tailwind CSS and server-only Supabase job board. Mongolian and English UI, search, categories, job details, employer submissions and administrator moderation.

## Local use

Install Node.js 20.9+ and pnpm, then run `pnpm install` and `pnpm dev`. Open http://localhost:3000/?lang=mn.

The current checkout already has a private administrator configuration. Read `.data/admin-setup.txt` locally for the username, password and authenticator enrollment secret. Add the secret to your authenticator app; login requires its six-digit code. Store credentials securely, then delete that setup file. Never share it or commit it. A fresh checkout can generate its own configuration with `pnpm setup:admin`. Restart the server after changing `.env.local`.

## Storage and imports

Without Supabase, jobs persist in ignored `.data/jobs.json`. This local file store is for development only. Partial Supabase configuration fails explicitly rather than silently switching storage.

The admin import button fetches Remotive jobs with attribution and original application links. A six-hour cache avoids excessive requests. Explicit Worldwide/Mongolia jobs are screened for contradictory restrictions. Ambiguous regional jobs remain pending; selected-country lists excluding Mongolia, inactive jobs and payment warnings are excluded. Fixed working hours appear as Mongolia schedule notes. Screening cannot guarantee an employer will accept an applicant. See `reports/mongolia-eligibility-review.md`.

No background refresh has been scheduled. Import manually through admin. Existing moderation and edits are preserved where appropriate. Public pages hide pending and inactive jobs and hide fictional examples when real approved jobs exist.

## Supabase and public launch

1. Run `supabase/schema.sql` and then all SQL files in `supabase/migrations/` in numeric order.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the server environment. Never expose the service role key to browsers.
3. Configure `SITE_URL` with your actual HTTPS origin and `SUPPORT_EMAIL` with your real contact address. Keep strong administrator, session and backup secrets from the setup script.
4. Run `pnpm check:launch`, then verify the connected database, login, submission, moderation and import workflows on a staging deployment.
5. Review privacy/terms, define retention practices, and submit `/sitemap.xml` in Google Search Console. Optionally set `GOOGLE_SITE_VERIFICATION` to the supplied verification token.

Local jobs are not automatically migrated to Supabase. SQL access is restricted to the server service role; shared database rate limits, sessions and API cache require migrations 003 and 004. No live Supabase integration or deployment has been verified in this checkout because credentials/public URL are absent. Production file storage is disabled by default; `ALLOW_LOCAL_STORAGE=true` is only an explicit single-machine testing escape hatch.

## Implemented protections and SEO

- Salted scrypt administrator passwords, TOTP with replay protection, signed opaque sessions stored as hashes, logout revocation, HttpOnly/SameSite cookies and Secure production cookies.
- Durable login/submission/import limits; shared Supabase storage for multi-instance hosting. Limits are global buckets, so heavy traffic may temporarily affect other users.
- Same-origin mutations, bounded JSON request bodies, link validation, honeypot and minimum submission time, private admin/API caching and noindex rules.
- Per-request script nonce CSP, frame protection, MIME sniffing prevention, referrer/permissions policies and production HSTS. Inline styles remain permitted for the current UI; this is not a formal security audit.
- Bilingual server-rendered metadata, canonical/hreflang links, sitemap, robots rules, Open Graph/Twitter metadata, language attributes and filtered-page noindex. Imported jobs do not publish JobPosting schema, respecting the source syndication restriction.
- Privacy and terms pages. Search Console ownership verification and Google indexing require a public site and account access; indexing/rankings are not guaranteed.

## Backups

`pnpm backup` creates an AES-256-GCM encrypted snapshot under ignored `.backups/`. Keep `BACKUP_KEY` separately and securely; losing it makes recovery impossible. Copy encrypted backups off the hosting machine. No automatic backup schedule is installed.

`node scripts/backup.mjs restore PATH_TO_BACKUP` decrypts into an ignored restore-preview file for inspection; it does not overwrite live jobs. Restoring live data requires a deliberate reviewed import.

## Verification

Run `pnpm test`, `pnpm typecheck`, `pnpm build` and `pnpm test:security-store`. With a local development server and private setup file, `pnpm smoke` checks login, moderation, pending privacy, invalid links and logout revocation. It creates and removes a disposable job. `node scripts/security-smoke.mjs` checks headers, localized SEO, cross-origin protection and spam limits; wait a minute between runs to reset submission limits.

On October 8, 2026: all 16 unit tests and the production build passed. Local 2FA/moderation workflow, persistent security storage, logout revocation, encrypted backup/decryption and development/production security-header smoke checks passed. Production dependency audit reported zero known vulnerabilities at that time. Live Supabase and Search Console remain unverified.

## Job seeker membership MVP

Homepage membership section supports browser-local saved job IDs and manually selected application stages (saved/applied/interview/offer). No account, payment, cross-device sync or automatic employer status updates are included. Email alerts are explicitly marked coming soon and do not send messages. Browser data clearing removes the saved list. Production compilation and TypeScript validation passed; interactive browser verification was blocked by the browser tool policy in this session.

## Additional source: We Work Remotely

The admin WWR import button adds the attribution-permitted public RSS feed, with six-hour caching, original source links and deduplication. Supabase requires migration 005 for its shared refresh lease. Local command: `node --conditions=react-server --import tsx scripts/import-wwr.ts` (Node 22+).

WWR Worldwide labels alone do not establish eligibility: descriptions must independently confirm worldwide hiring and pass contradiction screening; other candidates stay pending. General applications/talent pools are excluded. No quota is used to bypass eligibility checks.

October 9, 2026 source review: Remotive feed 19 jobs, Remote OK 99 jobs (examined, not integrated), WWR 89 jobs. WWR added 85 records initially; stricter screening marked 2 generic pools inactive and retained 83 pending candidates. Four previously reviewed Remotive listings remain public. The target of 100 active Mongolia-eligible public listings has not been achieved. WWR attribution permission: https://weworkremotely.com/remote-job-rss-feed .

## Project specifications

The six project documents are indexed in [docs/README.md](docs/README.md): product requirements, technical requirements, app flow, design brief, backend schema/access and implementation plan. They describe the existing MVP and separate planned features from implemented or tested behavior.

SEO checklist verification with a running server: node scripts/seo-smoke.mjs. See docs/07-seo-checklist.md.

## GitHub / Vercel readiness update — October 9, 2026

Himalayas, Jobicy and Remote OK import buttons are now integrated alongside Remotive/WWR. Run all migrations through 006 on Supabase. Himalayas reads up to 20 worldwide pages (bounded pass), checks UTC+8 and expiry; Jobicy uses anywhere and cursor handling; Remote OK requires explicit geography and employment type. Source credit and original source links remain visible. Missing records in bounded imports are not deactivated. Expiry is enforced on public reads. Deduplication preserves moderation and rejects cross-source title/company duplicates.

Local import screened 387 Himalayas records and 18 Jobicy records. Public board has 288 source-screened jobs; this is not direct employer verification. Remote OK's 99 current records produced no eligible, supported-employment additions. Repeated imports created zero new duplicates. Twenty-four unit tests, production build and security-store checks passed. Live Supabase/source RPCs, deployed runtime limits and GitHub CI remain unverified.

Run `node scripts/check-release.mjs` before uploading. [Deployment instructions](docs/08-deployment.md) cover GitHub, Supabase, Vercel environment variables, staging checks and Search Console. At this check: no Git remote/author identity, browser GitHub session logged out, and required production Supabase/SITE_URL/SUPPORT_EMAIL configuration missing. No repository was pushed or site deployed.
