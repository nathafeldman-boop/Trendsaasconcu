import { getAuth } from "@/lib/supabase/auth";

/** True when the request comes from a signed-in admin (profiles.is_admin). */
export async function isAdminRequest() {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return false;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  return !!data?.is_admin;
}
