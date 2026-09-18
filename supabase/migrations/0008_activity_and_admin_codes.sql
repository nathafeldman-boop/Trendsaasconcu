-- Live "what page/step is this user on" tracking, shown in the admin panel.
alter table public.profiles
  add column if not exists current_path text;

-- Access codes can now grant admin (dashboard) access, not just the paywall.
alter table public.access_codes
  add column if not exists grants_admin boolean not null default false;

-- Redeeming an admin-granting code also flips is_admin, in the same
-- redemption a user is limited to (access_code_redemptions.user_id is
-- unique) — so one code covers both access and admin instead of requiring
-- a second redemption that the unique constraint would block anyway.
create or replace function public.redeem_access_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_id uuid;
  v_max_uses integer;
  v_uses_count integer;
  v_revoked boolean;
  v_grants_admin boolean;
  v_inserted integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, max_uses, uses_count, revoked, grants_admin
    into v_code_id, v_max_uses, v_uses_count, v_revoked, v_grants_admin
    from public.access_codes
    where code = p_code
    for update;

  if v_code_id is null or v_revoked or v_uses_count >= v_max_uses then
    return false;
  end if;

  insert into public.access_code_redemptions (code_id, user_id)
  values (v_code_id, auth.uid())
  on conflict (user_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update public.access_codes set uses_count = uses_count + 1 where id = v_code_id;
  end if;

  update public.profiles
    set has_access = true,
        is_admin = is_admin or v_grants_admin
    where id = auth.uid();

  return true;
end;
$$;

-- CREATE OR REPLACE re-triggers Supabase's default grants, which would
-- silently undo the earlier hardening (redeem_access_code must stay
-- unreachable by anon, matching the rest of this project's RPCs).
revoke execute on function public.redeem_access_code(text) from public, anon;
grant execute on function public.redeem_access_code(text) to authenticated;
