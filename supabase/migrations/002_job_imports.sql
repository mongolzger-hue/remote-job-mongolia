alter table public.jobs add column if not exists "importInfo" jsonb;
alter table public.jobs drop constraint if exists jobs_category_check;
alter table public.jobs add constraint jobs_category_check check (category in ('Engineering','Design','Marketing','Customer support','Operations','Writing','Sales','Other'));
