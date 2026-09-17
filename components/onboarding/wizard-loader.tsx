"use client";

import dynamic from "next/dynamic";

const OnboardingWizard = dynamic(
  () => import("@/components/onboarding/wizard").then((m) => m.OnboardingWizard),
  { ssr: false }
);

export function WizardLoader() {
  return <OnboardingWizard />;
}
