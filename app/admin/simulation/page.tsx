import type { Metadata } from "next";
import { Simulation } from "@/components/simulation/simulation";

export const metadata: Metadata = {
  title: "Simulation — Admin SaaSFounder",
  robots: { index: false, follow: false },
};

export default function SimulationPage() {
  return <Simulation />;
}
