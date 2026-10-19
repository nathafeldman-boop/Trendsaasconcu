// Run once in the member's new Supabase project: the profiles table every
// SaaS needs, filled on signup and locked down with RLS. Written to be
// safely re-run (if not exists, duplicate-policy guards).
export const STARTER_SCHEMA = `
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  plan text,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "Chacun lit son profil" on public.profiles
    for select using ((select auth.uid()) = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Chacun modifie son profil" on public.profiles
    for update using ((select auth.uid()) = id);
exception when duplicate_object then null; end $$;

-- Users may change their name, never their plan or Stripe id.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
`;
