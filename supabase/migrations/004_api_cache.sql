create table if not exists public.api_cache (id text primary key, payload jsonb, fetched_at timestamptz, locked_until timestamptz);
alter table public.api_cache enable row level security;
revoke all on public.api_cache from anon, authenticated;
grant all on public.api_cache to service_role;
create or replace function public.rjm_claim_feed() returns boolean language plpgsql security invoker set search_path='' as $$
declare claimed text;
begin
 insert into public.api_cache(id,locked_until) values('remotive',now()+interval '60 seconds')
 on conflict(id) do update set locked_until=excluded.locked_until
 where (api_cache.locked_until is null or api_cache.locked_until<now()) and (api_cache.fetched_at is null or api_cache.fetched_at<now()-interval '6 hours')
 returning id into claimed;
 return claimed is not null;
end;
$$;
revoke all on function public.rjm_claim_feed() from public,anon,authenticated;
grant execute on function public.rjm_claim_feed() to service_role;
