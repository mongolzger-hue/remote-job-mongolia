create or replace function public.rjm_claim_named_feed(feed_id text) returns boolean language plpgsql security invoker set search_path='' as $$
declare claimed text;
begin
 if feed_id <> 'wwr' then raise exception 'Unknown feed'; end if;
 insert into public.api_cache(id,locked_until) values(feed_id,now()+interval '60 seconds')
 on conflict(id) do update set locked_until=excluded.locked_until
 where (api_cache.locked_until is null or api_cache.locked_until<now()) and (api_cache.fetched_at is null or api_cache.fetched_at<now()-interval '6 hours') returning id into claimed;
 return claimed is not null;
end;
$$;
revoke all on function public.rjm_claim_named_feed(text) from public,anon,authenticated;
grant execute on function public.rjm_claim_named_feed(text) to service_role;
