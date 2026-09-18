import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe — SaaSFounder",
  robots: { index: false, follow: false },
};

export default function ReinitialiserMotDePassePage() {
  return <ResetPasswordForm />;
}
