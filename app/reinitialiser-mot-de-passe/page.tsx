import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe — SaaSFounder",
};

export default function ReinitialiserMotDePassePage() {
  return <ResetPasswordForm />;
}
