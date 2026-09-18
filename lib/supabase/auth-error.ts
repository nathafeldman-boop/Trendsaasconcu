import type { AuthError } from "@supabase/supabase-js";

// Supabase auth errors come back in English with internal codes/wording.
// Translate the ones users can actually hit here instead of showing them
// raw ("email rate limit exceeded", "Invalid login credentials", ...).
export function translateAuthError(error: AuthError | Error): string {
  const code = "code" in error ? error.code : undefined;
  const message = error.message ?? "";

  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) {
    return "Email ou mot de passe incorrect.";
  }
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) {
    return "Ce compte n'est pas encore confirmé.";
  }
  if (code === "user_already_exists" || /already registered/i.test(message)) {
    return "Ce compte existe déjà. Connecte-toi plutôt.";
  }
  if (code === "over_email_send_rate_limit" || /rate limit/i.test(message)) {
    return "Trop de tentatives en peu de temps. Réessaie dans quelques minutes.";
  }
  if (code === "weak_password" || /password.*(least|characters)/i.test(message)) {
    return "Mot de passe trop faible — utilise au moins 8 caractères.";
  }
  if (code === "user_not_found") {
    return "Aucun compte ne correspond à cet email.";
  }
  if (/network|fetch failed|failed to fetch/i.test(message)) {
    return "Impossible de contacter le serveur. Vérifie ta connexion et réessaie.";
  }
  return "Une erreur est survenue. Réessaie.";
}
