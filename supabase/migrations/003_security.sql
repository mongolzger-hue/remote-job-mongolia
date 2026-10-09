create table if not exists public.admin_sessions (id text primary key, expires_at timestamptz not null);
create table if not exists public.rate_limits (id text primary key, count integer not null, expires_at timestamptz not null);
alter table public.admin_sessions enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.admin_sessions, public.rate_limits from anon, authenticated;
grant all on public.admin_sessions, public.rate_limits to service_role;
create or replace function public.rjm_rate_limit(bucket text, max_count integer, window_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare used integer;
begin
 if max_count < 1 or window_seconds < 1 then raise exception 'Invalid limit'; end if;
 insert into public.rate_limits as current (id,count,expires_at)
 values(bucket,1,now()+make_interval(secs=>window_seconds))
 on conflict(id) do update set
 count=case when current.expires_at<=now() then 1 else current.count+1 end,
 expires_at=case when current.expires_at<=now() then now()+make_interval(secs=>window_seconds) else current.expires_at end
 returning count into used;
 return used<=max_count;
end;
$$;
revoke all on function public.rjm_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.rjm_rate_limit(text,integer,integer) to service_role;
