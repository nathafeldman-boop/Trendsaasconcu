import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — SaaSFounder",
};

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions d'utilisation" updatedAt="17 septembre 2026">
      <p>
        SaaSFounder est un service qui aide les personnes qui veulent lancer un premier SaaS : trouver
        une idée, obtenir un prompt pour la construire avec une IA de codage, et un accompagnement sur
        le marketing pour trouver leurs premiers clients. En créant un compte, tu acceptes les
        conditions ci-dessous.
      </p>

      <section>
        <h2>1. Ce que SaaSFounder fournit</h2>
        <p>
          Un questionnaire pour cerner ta situation, une aide au choix d&apos;une idée de SaaS, un
          prompt de démarrage généré à partir de tes réponses, une checklist de lancement, et des
          conseils marketing (canal, formats de contenu). Certains contenus sont générés par un modèle
          d&apos;IA tiers (Mistral) ; quand ce service n&apos;est pas disponible, un contenu générique
          est utilisé à la place.
        </p>
      </section>

      <section>
        <h2>2. Ce que SaaSFounder ne garantit pas</h2>
        <ul>
          <li>Aucun résultat financier, aucun nombre de clients ou de revenus n&apos;est garanti.</li>
          <li>
            Les exemples chiffrés affichés dans l&apos;application (projections, scénarios) sont
            illustratifs et ne reflètent pas un cas réel.
          </li>
          <li>
            SaaSFounder ne construit pas ton produit à ta place : les prompts et conseils fournis sont
            un point de départ que tu utilises avec l&apos;outil de codage IA de ton choix.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Ton compte</h2>
        <p>
          Tu es responsable de la confidentialité de ton mot de passe. Tu peux supprimer ton compte à
          tout moment en nous contactant. Si tu utilises un code d&apos;accès ou un abonnement payant,
          l&apos;accès à l&apos;espace est lié à ton compte et n&apos;est pas transférable.
        </p>
      </section>

      <section>
        <h2>4. Paiement et résiliation</h2>
        <p>
          Quand un abonnement payant est proposé, les paiements sont traités par Stripe. Tu peux
          annuler ton abonnement à tout moment ; l&apos;accès reste actif jusqu&apos;à la fin de la
          période déjà payée. Les conditions de remboursement, si elles s&apos;appliquent, sont
          précisées au moment du paiement.
        </p>
      </section>

      <section>
        <h2>5. Contenu que tu fournis</h2>
        <p>
          L&apos;idée de SaaS et les messages que tu fournis restent les tiens. Tu nous autorises à les
          transmettre à Mistral (fournisseur d&apos;IA) uniquement pour générer tes prompts et réponses
          d&apos;assistant.
        </p>
      </section>

      <section>
        <h2>6. Modifications</h2>
        <p>
          Ces conditions peuvent évoluer à mesure que le service change. La date de mise à jour en haut
          de cette page reflète la dernière version.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>Pour toute question, contacte-nous depuis l&apos;assistant intégré à ton espace.</p>
      </section>
    </LegalPage>
  );
}
