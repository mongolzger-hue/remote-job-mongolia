# 5. Өгөгдлийн бүтэц ба хандалт

## Одоогийн өгөгдөл

| Storage | Агуулга | Хандалт |
|---|---|---|
| jobs | id, title, company, location, salary, category, remoteType, employment, description, applicationUrl, featured, status, createdAt, importInfo | Private DB table; public projection серверт шүүнэ; admin-only moderation |
| admin_sessions | Hashed session identifiers, expiry | Server service role; browser-д session cookie |
| rate_limits | Bucket/counter/expiry | Server/RPC only |
| api_cache | Feed ID, payload, fetched_at, locked_until | Server service role; refresh lease RPC |
| Browser localStorage | Saved job ID → saved/applied/interview/offer | Тухайн browser; серверт илгээхгүй |
| Encrypted backups | Jobs snapshot | Operator only; separate BACKUP_KEY |

Exact SQL нь `supabase/schema.sql` ба migrations 002–005; security store нь `lib/security-store.ts`. Эндэх тайлбараас field name тааж SQL бичихгүй, SQL файлыг уншина.

`status`: pending/approved. Import metadata: source, original URL, external ID, locationRequirement, eligibility, reason, importedAt, active, bilingual workingHours. Source нь одоогоор Remotive/We Work Remotely. Public criterion: approved + active; бодит зар байгаа үед mocks нуугдана.

## Хандалтын зааг

RLS enabled; anon/authenticated table access revoked; server service_role ашиглана. Service role нь RLS-ийг bypass хийдэг тул route authorization болон publicJobs filtering зайлшгүй. DB private байгаа нь route хамгаалалтыг орлохгүй. Live Supabase-д SQL/RLS/session behavior хараахан шалгаагүй.

Local fallback: `.data/jobs.json`, `.data/security.json`, feed cache. Ignore-д байна, multi-instance sync биш. Production file storage default disabled.

## Хадгалалт ба устгал

Admin job deletion; source feed disappearance нь metadata active=false. Хэсэгчилсэн feed-ээр бусад jobs deactivate хийж болохгүй. Session/counter expiry pruning security store-д хэрэгжинэ. Backup restore нь preview JSON гаргах бөгөөд live DB-г overwrite хийхгүй. Backups, submissions болон operator logs-ийн retention хугацааг launch-ээс өмнө батална.

## Дараагийн membership schema — хэрэгжээгүй

User auth identity, saved_jobs(user_id,job_id), applications(user_id,job_id,status), alert_preferences(user_id,filters,consent) байж болно. User-owned row policy, unique constraints, account deletion, consent/unsubscribe болон email delivery design батлагдахаас өмнө table үүсгэхгүй. Одоогоор CV, хувийн profile эсвэл төлбөрийн мэдээлэл хадгалахгүй.
