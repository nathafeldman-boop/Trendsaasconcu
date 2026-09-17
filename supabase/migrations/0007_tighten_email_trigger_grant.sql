-- Same reasoning as 0003: this is a trigger-only function, never meant to
-- be called directly via RPC.
revoke execute on function public.handle_user_email_update() from public;
