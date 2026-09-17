-- Profiles: one row per auth user, created automatically on signup.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Onboarding answers: one row per completed (or in-progress) wizard run.
create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.onboarding_responses enable row level security;

create policy "Users can view their own onboarding responses"
  on public.onboarding_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own onboarding responses"
  on public.onboarding_responses for insert
  with check (auth.uid() = user_id);
