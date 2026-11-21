import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL_UPDATED_AT, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions de remboursement — SaaSFounder",
  description: "La garantie « pas de vente en 2 jours » de SaaSFounder : les conditions et comment la demander.",
};

export default function RemboursementPage() {
  return (
    <LegalPage title="Conditions de remboursement" updatedAt={LEGAL_UPDATED_AT}>
      <p className="font-display text-lg font-semibold text-ink">Garantie « pas de vente en 2 jours ».</p>

      <section>
        <h2>1. La garantie</h2>
        <p>
          SaaSFounder s&apos;engage à te rembourser l&apos;intégralité de ton premier paiement si, après avoir appliqué la méthode
          pendant 48 heures, tu n&apos;as généré aucune vente. C&apos;est un engagement commercial volontaire, et la voie de
          remboursement que nous ouvrons, l&apos;accès à ton espace étant fourni immédiatement (voir le point 5).
        </p>
      </section>

      <section>
        <h2>2. Conditions à remplir</h2>
        <p>Les trois conditions suivantes sont cumulatives. Elles sont rappelées sur la page de tarifs, avant l&apos;achat.</p>
        <ul>
          <li>
            <strong>Publication</strong> : au moins 3 vidéos par jour, pendant chacun des deux jours qui suivent ton achat, sur au
            moins un réseau public (TikTok, Instagram, YouTube). Les vidéos font la promotion du SaaS issu de ton espace
            SaaSFounder.
          </li>
          <li>
            <strong>Délai</strong> : la demande est faite dans les 48 heures qui suivent ton achat. Passé ce délai, la garantie ne
            s&apos;applique plus.
          </li>
          <li>
            <strong>Abonnement actif</strong> : tu n&apos;as pas résilié ta formule avant de faire la demande. Une résiliation vaut
            renoncement à cette garantie.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Comment faire la demande</h2>
        <p>
          Écris à{" "}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Garantie 48 h")}`} className="underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>{" "}
          depuis l&apos;adresse email de ton compte, avec les liens vers les vidéos publiées. Aucun autre justificatif n&apos;est
          demandé. Nous répondons sous 72 heures.
        </p>
      </section>

      <section>
        <h2>4. Ce qui n&apos;ouvre pas droit au remboursement</h2>
        <ul>
          <li>Une demande faite après le délai de 48 heures.</li>
          <li>Une formule résiliée avant la demande.</li>
          <li>L&apos;absence de publication, ou moins de 3 vidéos sur l&apos;un des deux jours.</li>
          <li>
            Les échéances de renouvellement : la garantie porte sur ton premier paiement. Les renouvellements suivants ne sont pas
            remboursables : tu pouvais résilier à tout moment avant l&apos;échéance, et le service est resté disponible pendant
            toute la période payée.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Rétractation : pourquoi les 14 jours ne s&apos;appliquent pas</h2>
        <p>
          Le délai de rétractation de 14 jours prévu pour les achats à distance ne s&apos;applique pas ici : ton espace est un
          contenu numérique fourni dès le paiement validé (ton idée, ton prompt, la mise en ligne guidée, tes plans). Le code de la
          consommation prévoit cette exception pour un contenu numérique sans support matériel dont l&apos;exécution commence avant
          la fin du délai (article L221-28, 13°). En cochant la case prévue sur la page de tarifs, tu demandes cet accès immédiat et
          tu reconnais renoncer à ton droit de rétractation. C&apos;est la garantie du point 1 qui te protège.
        </p>
      </section>

      <section>
        <h2>6. Modalités de remboursement</h2>
        <p>
          Les paiements sont encaissés par Stripe. Le remboursement est effectué sur le moyen de paiement d&apos;origine, sous 14
          jours à compter de l&apos;acceptation de la demande.
        </p>
      </section>

      <section>
        <h2>7. Résiliation et renouvellements</h2>
        <p>
          Les formules 1 semaine, 1 mois et 3 mois se renouvellent automatiquement au prix indiqué avant l&apos;achat. Tu peux les
          résilier à tout moment depuis ton espace, sans frais ; la résiliation prend effet à la fin de la période en cours. Une
          échéance déjà prélevée n&apos;est pas remboursée : pour ne pas être prélevé, la résiliation doit intervenir avant la date
          d&apos;échéance. La formule À vie est un paiement unique, sans renouvellement.
        </p>
      </section>

      <section>
        <h2>8. Ce que cette garantie ne dit pas</h2>
        <p>
          Cette garantie porte sur le remboursement de ta formule, jamais sur un gain. SaaSFounder ne promet aucun revenu : aucun
          montant n&apos;est garanti, la méthode demande un travail régulier, et son résultat dépend du marché, de la concurrence et
          de la régularité de chacun. Les chiffres affichés sur le site sont des scénarios, pas des prévisions. Le service est
          réservé aux personnes de 16 ans et plus. Voir aussi les{" "}
          <Link href="/conditions" className="underline underline-offset-2">
            conditions générales de vente
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
