-- Defense in depth: these functions already reject unauthorized callers
-- internally (auth.uid() / is_admin() checks), but Postgres grants EXECUTE
-- to PUBLIC by default on function creation. Remove that default grant so
-- anon can't even reach the RPC endpoint, and handle_new_user (a trigger-only
-- function) isn't directly callable at all.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.promote_to_admin(text) from public;
grant execute on function public.promote_to_admin(text) to authenticated;
revoke execute on function public.redeem_access_code(text) from public;
grant execute on function public.redeem_access_code(text) to authenticated;
