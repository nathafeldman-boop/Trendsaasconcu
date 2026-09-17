-- Sync email onto profiles so the admin dashboard can list real users
-- without needing an admin.listUsers() call on every page load.

alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, email, is_admin)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.email,
    new.email = 'nathabuisseness@gmail.com'
  );
  return new;
end;
$$;

-- Keep email in sync if a user ever changes it via Supabase auth.
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update on auth.users
  for each row execute procedure public.handle_user_email_update();
