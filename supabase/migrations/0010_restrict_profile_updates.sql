-- 0009 granted UPDATE on every public table to authenticated, which on
-- profiles undid 0002's column-level grant: combined with the "Users can
-- update their own profile" policy, any signed-in user could set their own
-- is_admin / has_access / plan straight from the browser. Put the restriction
-- back. Only the columns the client legitimately writes stay updatable;
-- everything else is changed by security-definer functions or the
-- service-role Stripe webhook.
revoke update on public.profiles from authenticated;
grant update (first_name, last_seen_at, current_path) on public.profiles to authenticated;

-- Same idea for anon: no table needs anything from a signed-out visitor
-- beyond what RLS already returns (nothing), so drop the write grants.
revoke insert, update, delete on all tables in schema public from anon;
