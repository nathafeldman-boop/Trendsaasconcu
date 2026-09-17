import type { Metadata } from "next";
import { WizardLoader } from "@/components/onboarding/wizard-loader";

export const metadata: Metadata = {
  title: "Trouve ton idée — Élan",
  description: "Réponds à quelques questions pour recevoir ton idée, ton prompt et ton plan des 30 jours.",
};

export default function CommencerPage() {
  return <WizardLoader />;
}
