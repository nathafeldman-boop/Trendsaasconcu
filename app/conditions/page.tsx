import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { EXIT_OFFER_CENTS, OFFER_MINUTES, euros, planFor } from "@/lib/stripe/plans";
import { LEGAL_UPDATED_AT, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  alternates: { canonical: "/conditions" },
  title: "Conditions générales de vente — SaaSFounder",
};

const PLANS = (["monthly", "quarterly", "lifetime"] as const).map((id) => ({
  welcome: planFor(id, "launch"),
  standard: planFor(id, "standard"),
}));
const WEEKLY = planFor("weekly");

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions générales de vente" updatedAt={LEGAL_UPDATED_AT}>
      <p>
        Les présentes conditions régissent l&apos;utilisation du site saasfounder.fr et la souscription aux formules payantes de
        SaaSFounder. En créant un compte ou en souscrivant une formule, tu les acceptes.
      </p>

      <section>
        <h2>1. Définitions</h2>
        <ul>
          <li>
            <strong>Service</strong> : la plateforme SaaSFounder, qui propose un questionnaire gratuit et, avec une formule payante,
            un espace personnel pour lancer un SaaS.
          </li>
          <li>
            <strong>Espace</strong> : ce que la formule débloque : ton idée de SaaS, le prompt qui écrit ton site, la mise en ligne
            guidée, ton plan de lancement et, selon la formule, ton plan marketing, tes scripts vidéo, le coach IA et
            l&apos;accompagnement personnalisé. Le contenu de chaque formule est décrit sur la page de tarifs avant l&apos;achat.
          </li>
          <li>
            <strong>Client</strong> : toute personne physique de 16 ans ou plus qui souscrit une formule.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Accès au Service</h2>
        <p>
          Le questionnaire est accessible gratuitement. L&apos;accès à l&apos;Espace suppose la création d&apos;un compte et la
          souscription d&apos;une formule. Le Service est réservé aux personnes de 16 ans et plus. Tu es responsable de la
          confidentialité de ton mot de passe ; l&apos;accès est lié à ton compte et n&apos;est pas transférable.
        </p>
      </section>

      <section>
        <h2>3. Tarifs</h2>
        <p>Les tarifs en vigueur sont ceux affichés sur le site au moment de la souscription :</p>
        <ul>
          {PLANS.map(({ welcome, standard }) => (
            <li key={welcome.id}>
              <strong>{welcome.label}</strong> : {standard.price} {standard.period} ({welcome.summary.charAt(0).toLowerCase() + welcome.summary.slice(1)}).
              {welcome.billing.mode === "payment" ? " Paiement unique, sans renouvellement ni prélèvement ultérieur." : ""}
            </li>
          ))}
        </ul>
        <p>
          <strong>Prix de bienvenue</strong> : lors de la première visite de la page de tarifs, chaque formule est proposée à un
          prix de bienvenue pendant {OFFER_MINUTES} minutes, décomptées à l&apos;écran :{" "}
          {PLANS.map(({ welcome }) => `${welcome.price} ${welcome.period} pour la formule ${welcome.label}`).join(", ")}. Une formule
          souscrite pendant ce délai conserve son prix de bienvenue à chaque renouvellement, tant qu&apos;elle n&apos;est pas
          résiliée ; une nouvelle souscription après résiliation se fait au prix en vigueur. Le prix de bienvenue n&apos;est pas
          proposé à nouveau une fois le délai écoulé.
        </p>
        <p>
          <strong>Offres hors page de tarifs</strong> : la formule À vie peut être proposée une seule fois à{" "}
          {euros(EXIT_OFFER_CENTS)} au moment de quitter la page de tarifs ; la formule {WEEKLY.label} ({WEEKLY.price}{" "}
          {WEEKLY.period}, {WEEKLY.summary.toLowerCase()}, renouvelée chaque semaine) peut être proposée après un paiement non
          abouti. Ces offres sont à prix fixe.
        </p>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises. SaaSFounder peut modifier ses tarifs ; toute modification est
          notifiée au Client au moins trente (30) jours avant sa prise d&apos;effet et ne s&apos;applique qu&apos;aux échéances
          suivantes. Le Client qui la refuse peut résilier dans les conditions de l&apos;article 5.
        </p>
      </section>

      <section>
        <h2>4. Commande et paiement</h2>
        <p>
          La souscription s&apos;effectue en ligne. Le paiement est traité par Stripe ; SaaSFounder n&apos;a accès à aucune donnée
          bancaire. Les formules 1 semaine, 1 mois et 3 mois sont payables d&apos;avance et se renouvellent automatiquement à
          chaque échéance, au prix indiqué avant l&apos;achat, sauf résiliation. L&apos;accès à l&apos;Espace est ouvert dès la
          confirmation du paiement. En cas d&apos;échec de paiement d&apos;un renouvellement, l&apos;accès peut être suspendu
          jusqu&apos;à régularisation.
        </p>
      </section>

      <section>
        <h2>5. Durée et résiliation</h2>
        <p>
          Les formules à renouvellement sont sans engagement au-delà de la période payée. Le Client peut les résilier à tout moment,
          sans frais, depuis son Espace (« Gérer mon abonnement »). La résiliation prend effet à la fin de la période en cours ; le
          Client conserve l&apos;accès jusqu&apos;à cette date. Une échéance déjà prélevée n&apos;est pas remboursée, sauf
          application de la garantie de l&apos;article 7. La formule À vie ne se renouvelle pas.
        </p>
        <p>
          SaaSFounder peut suspendre ou fermer l&apos;accès d&apos;un Client en cas de manquement aux présentes conditions, après
          une mise en demeure restée sans effet pendant quinze (15) jours, sauf manquement grave justifiant une suspension
          immédiate.
        </p>
      </section>

      <section>
        <h2>6. Droit de rétractation</h2>
        <p>
          L&apos;Espace est un contenu numérique fourni immédiatement après le paiement. Avant de payer, le Client demande
          expressément cet accès immédiat et reconnaît renoncer à son droit de rétractation de 14 jours, en cochant la case prévue
          sur la page de tarifs (article L221-28, 13° du code de la consommation). La garantie de l&apos;article 7 s&apos;applique à
          la place.
        </p>
      </section>

      <section>
        <h2>7. Garantie « pas de vente en 2 jours »</h2>
        <p>
          SaaSFounder rembourse l&apos;intégralité du premier paiement au Client qui, après avoir appliqué la méthode pendant 48
          heures, n&apos;a généré aucune vente, dans les conditions détaillées sur la page{" "}
          <Link href="/remboursement" className="underline underline-offset-2">
            conditions de remboursement
          </Link>
          , qui font partie des présentes.
        </p>
      </section>

      <section>
        <h2>8. Ce que le Service ne garantit pas</h2>
        <ul>
          <li>Aucun revenu, aucun nombre de clients ni aucun résultat financier n&apos;est garanti.</li>
          <li>
            Les chiffres affichés sur le site (projections, scénarios, exemples) sont illustratifs et ne constituent pas des
            prévisions.
          </li>
          <li>
            Certains contenus sont générés par un modèle d&apos;IA tiers (Claude, d&apos;Anthropic) ; le Client reste responsable
            de l&apos;usage qu&apos;il en fait et du produit qu&apos;il construit.
          </li>
        </ul>
      </section>

      <section>
        <h2>9. Propriété et contenu</h2>
        <p>
          SaaSFounder conserve l&apos;intégralité des droits sur le Service, son interface et ses contenus. La formule confère au
          Client un droit d&apos;usage personnel, non exclusif et non cessible. Le Client peut librement utiliser, pour son propre
          projet, le contenu de son Espace. L&apos;idée et les messages fournis par le Client restent les siens ; il autorise leur
          transmission à Anthropic uniquement pour générer ses contenus.
        </p>
      </section>

      <section>
        <h2>10. Données personnelles</h2>
        <p>
          Le traitement des données est décrit dans la{" "}
          <Link href="/confidentialite" className="underline underline-offset-2">
            politique de confidentialité
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>11. Contact, litiges et droit applicable</h2>
        <p>
          Pour toute question ou réclamation : <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-2">{SUPPORT_EMAIL}</a>.
          Les présentes conditions sont soumises au droit français. En cas de litige, le Client peut recourir gratuitement à un
          médiateur de la consommation, après une réclamation écrite restée sans réponse satisfaisante.
        </p>
      </section>
    </LegalPage>
  );
}
