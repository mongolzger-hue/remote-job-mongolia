begin;
-- Keep normal prices intact; support the server-authorized owner's Wire test order.
alter table public.membership_orders drop constraint if exists membership_orders_amount_check;
alter table public.membership_orders add constraint membership_orders_amount_check
 check(amount between 1000 and 1000000 or (amount=500 and provider='wire' and duration_days=30));
commit;
