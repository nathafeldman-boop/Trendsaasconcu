import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité — SaaSFounder",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updatedAt="17 septembre 2026">
      <p>
        Cette page explique quelles données SaaSFounder collecte, pourquoi, et avec qui elles sont
        partagées.
      </p>

      <section>
        <h2>1. Données collectées</h2>
        <ul>
          <li>Prénom, email et mot de passe (hashé) lors de la création de ton compte.</li>
          <li>
            Tes réponses au questionnaire (situation, objectifs, idée de SaaS, etc.), pour personnaliser
            ton prompt et tes conseils.
          </li>
          <li>Ton avancée dans l&apos;espace (checklist, outil choisi, canal marketing).</li>
          <li>
            Si tu connectes ta clé Stripe pour suivre ton MRR, cette clé est stockée de façon à n&apos;être
            lisible que par nos serveurs, jamais par un autre utilisateur ni transmise à un tiers autre
            que Stripe lui-même.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Avec qui tes données sont partagées</h2>
        <ul>
          <li><strong>Supabase</strong> : hébergement de la base de données et de l&apos;authentification.</li>
          <li>
            <strong>Mistral</strong> : ton idée de SaaS et tes messages à l&apos;assistant lui sont
            transmis pour générer tes prompts et réponses.
          </li>
          <li>
            <strong>Stripe</strong> : traitement des paiements, si tu souscris un abonnement, ou lecture
            de ton propre compte Stripe si tu le connectes pour suivre ton MRR.
          </li>
          <li>
            <strong>Vercel</strong> : hébergement de l&apos;application.
          </li>
        </ul>
        <p>Nous ne vendons aucune donnée à des tiers.</p>
      </section>

      <section>
        <h2>3. Cookies</h2>
        <p>
          Seuls des cookies techniques nécessaires à la connexion (session Supabase) sont utilisés. Pas
          de cookies publicitaires ou de traceurs tiers.
        </p>
      </section>

      <section>
        <h2>4. Tes droits</h2>
        <p>
          Tu peux demander l&apos;accès, la correction ou la suppression de tes données à tout moment
          en nous contactant depuis l&apos;assistant intégré à ton espace. La suppression de ton compte
          entraîne la suppression de tes réponses et de ton avancée.
        </p>
      </section>

      <section>
        <h2>5. Conservation</h2>
        <p>
          Tes données sont conservées tant que ton compte est actif. Si tu supprimes ton compte, elles
          sont supprimées de nos bases dans un délai raisonnable.
        </p>
      </section>
    </LegalPage>
  );
}
