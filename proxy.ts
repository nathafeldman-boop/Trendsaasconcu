import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Only where the server reads the session. The landing page, pricing and
// legal pages are static and served straight from the CDN, and the Stripe
// webhook has no session to refresh.
export const config = {
  matcher: [
    "/espace/:path*",
    "/admin/:path*",
    "/acces",
    "/connexion",
    "/inscription",
    "/auth/:path*",
    "/api/((?!stripe/webhook).*)",
  ],
};
