# 2. Техникийн шаардлага

## Stack ба ажиллагаа

Next.js App Router, TypeScript, React, Tailwind CSS, server-only Supabase adapter. Next.js шинэ API хэрэглэхийн өмнө AGENTS.md-ийн дагуу суусан хувилбарын `node_modules/next/dist/docs/`-ийг уншина. Dependency resolution-ийн эх сурвалж нь lockfile.

Ердийн локал хэрэглээнд Node.js 20.9+, pnpm install/dev. `scripts/import-wwr.ts` дахь `process.loadEnvFile` хэрэглэхэд Node 22+ ашиглана. Node server шаардлагатай; зөвхөн static export нь server mutations/auth/storage-г ажиллуулахгүй.

## Сервер ба client

- Homepage/detail серверээс зөвхөн publicJobs үр дүнг авна.
- Client membership browser localStorage-д job ID ба manually selected status хадгална.
- Form/admin/import mutations Route Handler-аар явна; same-origin, body validation, rate limits болон admin checks серверт хэрэгжинэ.
- Supabase service role browser bundle-д орохгүй. DB тохиргоо алдаатай үед mock fallback хийхгүй.
- Local JSON нь хөгжүүлэлтийн persistent single-machine store. Production multi-instance deployment Supabase хэрэглэнэ.

## Хамгаалалт

Scrypt salted password hash, TOTP/replay guard, opaque signed session, серверт session hash, logout revocation; HttpOnly/SameSite cookie, production Secure cookie. CSP nonce, frame protection, nosniff, referrer/permissions policy, production HSTS. Inline styles зөвшөөрөгдсөн хэвээр; formal audit хийгдээгүй.

JSON body хэмжээ хязгаартай, application URL validation, honeypot/minimum submission time, durable global rate buckets. Global bucket нь их ачааллын үед бусад хэрэглэгчид нөлөөлж болох тул traffic өсөхөд trusted client identifier/per-user limits дизайныг дахин үнэлнэ.

## SEO ба эх сурвалж

Server metadata, bilingual canonical/hreflang, robots/sitemap, OG/Twitter metadata; filtered search болон admin noindex. Imported source нөхцөлийг шалгалгүй Google JobPosting syndication хийхгүй. Public SITE_URL, SUPPORT_EMAIL, Search Console ownership live орчинд шаардлагатай.

## Шалгалт

`pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm test:security-store`. Локал сервер дээр smoke болон security-smoke. Одоогийн 19 unit tests/build давсан; membership interactive behavior, live Supabase, public deployment, email alerts шалгаагүй. Шинэ API нь timeout, cache, validation, pagination completeness, dedupe ба partial failure protection шаардана.
