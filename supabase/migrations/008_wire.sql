begin;
alter table public.membership_orders add column if not exists provider text not null default 'bank' check(provider in ('bank','wire'));
alter table public.membership_orders add column if not exists wire_intent text unique;
alter table public.membership_orders add column if not exists checkout_url text;
create or replace function public.rjm_settle_wire(order_id uuid, intent_id text) returns timestamptz
language plpgsql security invoker set search_path='' as $$
declare item public.membership_orders%rowtype; until_at timestamptz;
begin
 select * into item from public.membership_orders where id=order_id for update;
 if not found or item.provider<>'wire' or item.wire_intent is distinct from intent_id then raise exception 'Invalid payment'; end if;
 if item.status='approved' then select expires_at into until_at from public.memberships where user_id=item.user_id; return until_at; end if;
 if item.status<>'pending' then raise exception 'Order unavailable'; end if;
 return public.rjm_review_membership(order_id,true,'wire-api');
end; $$;
revoke all on function public.rjm_settle_wire(uuid,text) from public,anon,authenticated;
grant execute on function public.rjm_settle_wire(uuid,text) to service_role;
commit;
