# GitHub → Supabase → Vercel → Google

2026-10-09. Кодыг compile/test хийж болно; live deployment нь account access болон production storage-оос хамаарна.

## GitHub

Repository: https://github.com/mongolzger-hue/remote-job-mongolia (public). `.env.local`, `.data/`, `.backups/` болон admin setup credentials-ийг upload хийхгүй. `.gitignore`/`.vercelignore` нэмэгдсэн. GitHub checks workflow unit tests, types, security store, build ажиллуулна; анхны workflow амжилттай дууссан.

GitHub account, remote болон main branch push тохируулагдсан. GitHub нь source repository, Vercel нь runtime.

## Supabase

Project үүсгэн SQL editor-д schema болон 002–006 migrations-ийг дарааллаар ажиллуулна. `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`-ийг server environment-д хадгална. Jobs, sessions, rate limits, cache + named feed RPCs staging дээр шалгана.

Локал `.data/jobs.json` GitHub/Vercel рүү илгээгдэхгүй. Live project дээр импорт дахин ажиллуулах эсвэл reviewed local snapshot-оос тусдаа data migration хийх шаардлагатай. Production preview нь Supabase-гүйгээр бодит зар болон write workflows ажиллуулахад бэлэн биш. `ALLOW_LOCAL_STORAGE=true`-г Vercel дээр тавихгүй.

## Vercel

GitHub repository import → Next.js framework → install `pnpm install --frozen-lockfile`, build `pnpm build`; output directory framework default. Node 22 сонгоно.

Production/server environment:

- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_TOTP_SECRET, SESSION_SECRET
- BACKUP_KEY (backup-ыг persistent/local operator орчноос ажиллуулна; Vercel filesystem дээр найдвартай хадгалахгүй)
- SITE_URL: тухайн production `https://…vercel.app` origin
- SUPPORT_EMAIL: бодит холбоо барих хаяг
- GOOGLE_SITE_VERIFICATION: Search Console token авсны дараа
- ALLOW_LOCAL_STORAGE=false

Secret values-ийг чат, source code, GitHub body/log-д оруулахгүй. Preview deployment нь production DB-г санамсаргүй өөрчлөхгүй байхаар тусдаа staging project/config ашиглана.

Production domain тодорхой болмогц SITE_URL тохируулаад redeploy хийнэ. Vercel custom domain шаардахгүйгээр provider URL өгдөг; account/plan-ийн ашиглалтын нөхцөлийг operator шалгана. Import endpoint maxDuration=60 боловч provider limits болон олон page fetch-ийн runtime staging дээр хэмжинэ. Таймаутын үед complete feed болсон гэж зар deactivate хийхгүй.

## Live шалгалт

2026-10-09: https://remote-job-mongolia-1gys.vercel.app нийтлэгдсэн. Supabase project eoykgnoqndpeuietgxol-д schema + 002–006 migrations амжилттай; дөрвөн хүснэгтийн server connectivity шалгасан. 484 source record шилжүүлсэн; ерөнхий бүртгэл/туршилт/бүсийн хязгаарлалттай 13 зар pending болгосны дараа 275 public зар. Public API key дөрвөн хүснэгт унших эрхгүйг шалгасан. Production-only sensitive environment variables хадгалсан; preview нь production credentials авахгүй. Live SEO smoke 10 bilingual pages амжилттай. Admin username/password/TOTP нэвтрэлт live дээр амжилттай. SUPPORT_EMAIL болон Google ownership verification тохируулагдаагүй; ажил олгогчийн form/moderation live mutation болон importer runtime бүрэн тестлээгүй.

`check:launch` орчин ба DB tables шалгана. HTTPS homepage, хоёр хэл, sitemap/robots, canonical public origin, CSP/nonce hydration, posting pending, admin 2FA, moderation, logout, importer cache/RPC, DB grants/RLS, backup restore шалгана. `SMOKE_BASE_URL`-тай SEO script staging/live HTML шалгаж болно. Mutation smoke нь зөвхөн тусгай disposable staging өгөгдөл дээр.

## Google — хэзээ хийх вэ?

Public HTTPS production сайт ба SITE_URL зөв болж, live шалгалт давмагц Search Console тохируулна. Domain худалдаж авах шаардлагагүй URL-prefix property сонгож болно. Operator Google account-аараа ownership token авна → GOOGLE_SITE_VERIFICATION → redeploy → verify → `/sitemap.xml` submit → URL Inspection-аар homepage шалгана.

Энэ нь indexing хүсэлт; Google хэзээ индексжүүлэх, ranking хэд болохыг баталгаатай амлахгүй. Localhost indexing, эсвэл deployment/account access-гүй ownership verification хийхгүй.

## Шинэ эх сурвалж

Himalayas, Jobicy, Remote OK admin import buttons нэмэгдсэн. Himalayas 24h, Jobicy/Remote OK 6h cache; country/timezone/expiry checks, original attribution URLs, dedupe. Himalayas pass нь хамгийн ихдээ 20 worldwide pages; partial/bounded pass бусад unseen jobs deactivate хийхгүй. Source API өөрчлөлт, алдааг оператор хянах шаардлагатай. Source screen нь employer guarantee биш.
