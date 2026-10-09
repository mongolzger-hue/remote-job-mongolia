begin;
alter table public.jobs add column if not exists "membersOnly" boolean not null default false;
create table if not exists public.membership_settings (
 id integer primary key check(id=1), amount integer not null check(amount between 1000 and 1000000),
 duration_days integer not null check(duration_days between 1 and 366), bank_name text not null default '',
 account_number text not null default '', account_name text not null default '', refund_policy text not null default '', enabled boolean not null default false,
 check(not enabled or (length(bank_name)>0 and length(account_number)>0 and length(account_name)>0 and length(refund_policy)>=20))
);
insert into public.membership_settings(id,amount,duration_days) values(1,10000,30) on conflict(id) do nothing;
create table if not exists public.memberships(user_id uuid primary key references auth.users(id) on delete cascade, expires_at timestamptz not null);
create table if not exists public.membership_orders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 amount integer not null check(amount between 1000 and 1000000), duration_days integer not null check(duration_days between 1 and 366),
 payment_reference text not null unique check(length(payment_reference) between 4 and 80),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by text
);
create unique index if not exists one_pending_membership_order on public.membership_orders(user_id) where status='pending';
create table if not exists public.member_saved_jobs (
 user_id uuid not null references auth.users(id) on delete cascade, job_id text not null references public.jobs(id) on delete cascade,
 status text not null check(status in ('saved','applied','interview','offer')), updated_at timestamptz not null default now(),primary key(user_id,job_id)
);
alter table public.membership_settings enable row level security;
alter table public.memberships enable row level security;
alter table public.membership_orders enable row level security;
alter table public.member_saved_jobs enable row level security;
revoke all on public.membership_settings,public.memberships,public.membership_orders,public.member_saved_jobs from anon,authenticated;
grant all on public.membership_settings,public.memberships,public.membership_orders,public.member_saved_jobs to service_role;
create or replace function public.rjm_review_membership(order_id uuid, approve boolean, reviewer text) returns timestamptz
language plpgsql security invoker set search_path='' as $$
declare item public.membership_orders%rowtype; until_at timestamptz;
begin
 select * into item from public.membership_orders where id=order_id for update;
 if not found then raise exception 'Order not found'; end if;
 if item.status<>'pending' then raise exception 'Order already reviewed'; end if;
 if approve then
  insert into public.memberships as current(user_id,expires_at) values(item.user_id,now()+make_interval(days=>item.duration_days))
  on conflict(user_id) do update set expires_at=greatest(current.expires_at,now())+make_interval(days=>item.duration_days)
  returning expires_at into until_at;
 end if;
 update public.membership_orders set status=case when approve then 'approved' else 'rejected' end,reviewed_at=now(),reviewed_by=reviewer where id=order_id;
 return until_at;
end; $$;
revoke all on function public.rjm_review_membership(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.rjm_review_membership(uuid,boolean,text) to service_role;
commit;
