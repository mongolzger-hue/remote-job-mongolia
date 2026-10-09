-- Run once in the Supabase SQL editor. All writes go through the server.
create table if not exists public.jobs (
 id text primary key,
 title text not null,
 company text not null,
 location text not null,
 salary text not null,
 category text not null check (category in ('Engineering','Design','Marketing','Customer support','Operations','Writing','Sales','Other')),
 "remoteType" text not null check ("remoteType" in ('Worldwide','Asia-Pacific','Mongolia')),
 employment text not null check (employment in ('Full-time','Part-time','Contract')),
 description text not null,
 "applicationUrl" text not null check ("applicationUrl" ~ '^https?://'),
 featured boolean not null default false,
 status text not null default 'pending' check (status in ('pending','approved')),
 "createdAt" timestamptz not null default now(),
 "importInfo" jsonb
);
alter table public.jobs enable row level security;
-- Public API keys cannot access records. The server uses the secret service role key.
revoke all on public.jobs from anon, authenticated;
grant all on public.jobs to service_role;
create index if not exists jobs_status_created on public.jobs (status,"createdAt" desc);
