import type { Metadata } from "next";
import { AccessGate } from "@/components/access/access-gate";

export const metadata: Metadata = {
  title: "Code d'accès — SaaSFounder",
  description: "Entre ton code d'accès pour rejoindre ton espace SaaSFounder.",
};

export default function AccesPage() {
  return <AccessGate />;
}
