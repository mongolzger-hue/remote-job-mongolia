# 6. Хэрэгжүүлэх төлөвлөгөө

## 1 — Хэрэгжсэн локал MVP

Homepage/filter/detail/post/admin, bilingual UI; Remotive/WWR importer; 2FA/security headers/rate limits; SEO/privacy/terms; encrypted backup. 19 unit tests болон production build давсан. Local moderation/security/backup smoke checks хийсэн. Энэ нь public deployment acceptance биш.

## 2 — Нэн түрүүнд: шинэ эх сурвалж ба 100 зар

1. [Source research](../reports/job-source-research.md)-ийн Himalayas → Jobicy → Remote OK.
2. Source-specific permissions/cache/pagination/expiry normalization. Himalayas 24h sync; Jobicy нэг цагаас ойр polling хийхгүй.
3. Country/worldwide evidence, UTC+8/time overlap болон full-description contradiction screening.
4. Cross-source dedupe, moderation preservation, deleted-job policy, complete-vs-partial feed safety.
5. Fixture tests + real feed import + published count audit. 100 active unique eligible jobs хүрээгүй бол тодорхой тайлагнана; mock/pending records-оор нөхөхгүй.

Хүлээн авах: source credit/original apply link, no unsafe HTML, stale/expired removal, no duplicate publication, failures preserve valid data, shared Supabase cache behavior. API нийт тоо eligibility count биш.

## 3 — Membership баталгаажуулалт

Browser save/status/remove/reload, corrupt/unavailable storage, language switch, mobile layout шалгах. Одоогийн local MVP-г account service гэж нэрлэхгүй. Account/sync/alerts шаардвал Supabase Auth, user policies, consent/unsubscribe, delivery testing нэмэх; төлбөргүй эхний хувилбараас paid membership рүү автоматаар шилжүүлэхгүй.

## 4 — Live backend ба launch

Supabase credentials, SQL schema+all migrations, support email, actual HTTPS origin. `check:launch` → staging route/auth/RLS/import tests → smoke cleanup → backup/restore exercise. Public host credentials/configuration байхгүй тул deployment одоогоор хүлээгдэж байгаа.

Operator retention policy ба support contact; Search Console ownership → sitemap submit. Source syndication restrictions зөрчихгүй. Google indexing/ranking амлахгүй.

## 5 — Үйл ажиллагаа

Feed health/error logs, periodic expiry review, dependency audit, encrypted off-machine backups ба restore drills. Background importer/backup scheduler одоогоор суулгаагүй; бодит hosting сонгосны дараа cadence/notification/credentials шийднэ.

## Шийдвэр шаардсан хамаарал

Public Supabase/hosting account access, real support email, domain эсвэл provider HTTPS origin; account membership хэрэгтэй эсэх; email provider ба consent policy. Эдгээргүйгээр locally complete гэж хэлж болох ч fully launched гэж хэлэхгүй.
