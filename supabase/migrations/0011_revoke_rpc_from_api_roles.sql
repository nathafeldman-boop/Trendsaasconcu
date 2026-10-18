-- 0003 / 0007 revoked EXECUTE from PUBLIC, but Supabase also grants it
-- explicitly to anon and authenticated, so these stayed reachable through
-- /rest/v1/rpc. Trigger-only functions must not be callable at all, and
-- promote_to_admin has no business being reachable while signed out (it
-- checks is_admin() itself, this is defense in depth).
--
-- is_admin() and redeem_access_code() keep their grants on purpose: RLS
-- policies call is_admin() as the querying role, and redeeming a code is
-- what signed-in users are meant to do.
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_user_email_update() from anon, authenticated;
revoke execute on function public.promote_to_admin(text) from anon;
