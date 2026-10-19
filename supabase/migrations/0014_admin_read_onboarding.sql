-- The admin journey page (/admin/parcours/[id]) shows a member's
-- questionnaire answers next to their activity. Read-only, admins only.
create policy "Admins can view all onboarding responses"
  on public.onboarding_responses for select
  using (public.is_admin());
