import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié — SaaSFounder",
  robots: { index: false, follow: false },
};

export default function MotDePasseOubliePage() {
  return <ForgotPasswordForm />;
}
