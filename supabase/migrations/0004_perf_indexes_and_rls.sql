-- Cheap performance wins flagged by the Supabase advisor: index the two
-- uncovered foreign keys, and wrap auth.uid() as (select auth.uid()) in RLS
-- policies so Postgres evaluates it once per query instead of once per row.

create index if not exists access_code_redemptions_code_id_idx
  on public.access_code_redemptions (code_id);

create index if not exists access_codes_created_by_idx
  on public.access_codes (created_by);

alter policy "Users can view their own profile"
  on public.profiles
  using ((select auth.uid()) = id);

alter policy "Users can update their own profile"
  on public.profiles
  using ((select auth.uid()) = id);

alter policy "Users can view their own onboarding responses"
  on public.onboarding_responses
  using ((select auth.uid()) = user_id);

alter policy "Users can insert their own onboarding responses"
  on public.onboarding_responses
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own onboarding responses"
  on public.onboarding_responses
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can view their own redemption"
  on public.access_code_redemptions
  using ((select auth.uid()) = user_id);

alter policy "Users can manage their own builder progress"
  on public.builder_progress
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can manage their own marketing progress"
  on public.marketing_progress
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can insert their own stripe key"
  on public.stripe_connections
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own stripe key"
  on public.stripe_connections
  using ((select auth.uid()) = user_id);
