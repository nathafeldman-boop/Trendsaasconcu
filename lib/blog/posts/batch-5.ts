import type { BlogPost } from "@/lib/blog/types";

export const POSTS_5: BlogPost[] = [
  {
    slug: "lancer-un-saas-jeune",
    title: "Lancer un SaaS à 16, 18 ou 20 ans : ce qu'il faut savoir",
    description:
      "Tu es jeune et tu veux lancer ton SaaS ? Ce que tu peux faire avant 18 ans, le statut, les paiements, l'organisation avec les études, et tes vrais avantages.",
    category: "lancer",
    date: "2026-12-14",
    body: `Être jeune n'est pas un frein pour lancer un SaaS. C'est même souvent un avantage : du temps, une aisance naturelle avec les outils et les réseaux sociaux, et peu de charges. Il y a juste quelques règles à connaître.

> Ces informations sont des repères généraux pour la France. Vérifie les règles en vigueur auprès de l'Urssaf et des plateformes que tu utilises.

## Avant 18 ans : ce qui est possible

### Construire et tester
Rien ne t'empêche de construire ton SaaS, de le montrer, de trouver des utilisateurs et de récolter leurs retours. C'est d'ailleurs la partie la plus longue.

### Le statut
En France, un mineur peut, sous conditions, créer une micro-entreprise à partir de 16 ans : avec l'autorisation de ses représentants légaux pour certaines démarches, ou s'il est émancipé. Les détails sont sur les sites officiels. Voir aussi notre article sur le [statut micro-entreprise](/blog/statut-micro-entreprise-saas).

### Les paiements
La plupart des plateformes de paiement, dont Stripe, demandent que le titulaire du compte soit majeur. Avant 18 ans, la solution la plus simple est souvent qu'un **parent** ouvre le compte et la structure, en accord avec toi, en attendant ta majorité.

## À 18 ans et plus

Tu peux tout faire en ton nom : micro-entreprise, compte Stripe, compte bancaire dédié. Si tu es étudiant, vérifie l'impact sur ta bourse ou ta situation fiscale avant de te lancer.

## Organiser son temps avec les études

- **Des créneaux fixes** : une heure par jour vaut mieux qu'une journée entière une fois par mois.
- **Une seule priorité par semaine** : construire, ou trouver des clients, pas tout à la fois.
- **Les vacances pour les gros chantiers** : la construction du MVP, par exemple.

## Tes vrais avantages

- **Le temps** : peu de charges fixes, donc tu peux te permettre d'apprendre.
- **Les réseaux sociaux** : tu sais naturellement ce qui marche sur [TikTok](/blog/vendre-un-saas-avec-tiktok).
- **L'IA** : tu apprends vite à t'en servir. Voir [vibe coding](/blog/vibe-coding).
- **L'histoire** : « J'ai 17 ans et j'ai créé un outil pour les coiffeurs » intrigue et se partage.

## Les pièges à éviter

- **Les promesses de richesse rapide** : un SaaS demande du travail régulier.
- **Négliger les études** : ton SaaS doit compléter ton parcours, pas le remplacer sur un coup de tête.
- **Cacher le projet à tes parents** : pour les paiements et le statut, tu auras besoin d'eux avant 18 ans.

Pour démarrer, commence par [trouver une idée de SaaS qui se vend](/blog/trouver-une-idee-de-saas).`,
    faq: [
      {
        q: "Peut-on créer un SaaS avant 18 ans ?",
        a: "Oui, tu peux le construire et trouver des utilisateurs. Pour le statut et les paiements, des conditions s'appliquent avant 18 ans : l'aide d'un parent est souvent nécessaire.",
      },
      {
        q: "Un mineur peut-il avoir un compte Stripe ?",
        a: "Stripe demande en général que le titulaire du compte soit majeur. Avant 18 ans, c'est souvent un parent qui ouvre le compte, en accord avec toi.",
      },
    ],
  },
  {
    slug: "no-code-ou-ia",
    title: "No-code ou IA : quelle approche pour ton premier SaaS ?",
    description:
      "No-code (Bubble, Softr) ou IA qui écrit le code (Lovable, Claude Code) : différences, avantages, limites, et quelle approche choisir pour lancer ton SaaS.",
    category: "creer",
    date: "2026-12-16",
    body: `Il y a quelques années, le no-code était LA solution pour créer un logiciel sans programmer. Aujourd'hui, l'IA qui écrit du code change la donne. Les deux approches ont leurs forces. Voici comment choisir.

## Le no-code, c'est quoi

Des outils comme **Bubble**, **Softr** ou **Glide** te permettent de construire une application en **glissant des blocs** et en configurant des règles, sans voir le code.

**Avantages**
- Visuel, tu vois exactement ce que tu construis.
- Pas de code à maintenir.
- Communautés et modèles nombreux.

**Limites**
- Tu dépends de la plateforme : prix, fonctions, hébergement.
- Les besoins spécifiques peuvent devenir compliqués.
- Il faut apprendre la logique propre à chaque outil.

## L'IA qui écrit le code, c'est quoi

Avec **Lovable**, **Bolt**, **Replit** ou **Claude Code**, tu décris ce que tu veux en français, et l'IA écrit du **vrai code**. Voir [vibe coding](/blog/vibe-coding).

**Avantages**
- Tu décris en langage naturel, pas besoin d'apprendre un outil.
- Le code t'appartient : tu peux l'héberger où tu veux.
- Pas de limite théorique de fonctions.

**Limites**
- Il faut tester et corriger avec méthode.
- Plus le projet grossit, plus il faut être précis.
- La sécurité doit être vérifiée explicitement.

## Comment choisir

- **Ton outil ressemble à une base de données avec des formulaires** (annuaire, suivi, réservations simples) : le no-code peut suffire.
- **Ton outil a une logique spécifique** (calculs, automatisations, IA intégrée) : l'IA qui code est souvent plus flexible.
- **Tu veux être propriétaire de ton produit** à long terme : l'IA qui code.
- **Tu veux un résultat visuel aujourd'hui sans rien installer** : Lovable, Bolt ou un outil no-code.

## Ce qui compte vraiment

Les clients ne savent pas et ne se soucient pas de la façon dont ton SaaS est construit. Ils veulent qu'il **règle leur problème** et qu'il **marche**. Choisis l'approche qui te permet de lancer le plus vite, puis concentre-toi sur la vente.

Notre [comparatif Lovable, Bolt, Replit et Claude Code](/blog/lovable-bolt-replit-comparatif) t'aide à choisir l'outil précis.`,
    faq: [
      {
        q: "Quelle différence entre no-code et IA pour créer une application ?",
        a: "Le no-code assemble des blocs visuels dans une plateforme, sans code. L'IA écrit du vrai code à partir de ta description, que tu possèdes et peux héberger où tu veux.",
      },
      {
        q: "Le no-code est-il dépassé ?",
        a: "Non, il reste efficace pour des outils simples type base de données et formulaires. L'IA est souvent plus flexible pour des logiques spécifiques.",
      },
    ],
  },
  {
    slug: "supabase-debutant",
    title: "Supabase pour débutant : base de données et comptes utilisateurs de ton SaaS",
    description:
      "Supabase gère la base de données, les comptes utilisateurs et la sécurité de ton SaaS. Ce que c'est, pourquoi l'utiliser, et les réglages à ne pas oublier.",
    category: "creer",
    date: "2026-12-18",
    body: `Presque tous les SaaS ont besoin de deux choses : **stocker des données** (les rendez-vous, les factures, les clients) et **gérer des comptes** (inscription, connexion). **Supabase** fait les deux, et c'est l'un des outils préférés des outils d'IA comme Lovable.

## Ce que fait Supabase

- **Une base de données** (PostgreSQL) pour stocker les informations de ton application.
- **L'authentification** : inscription par e-mail, connexion avec Google, mot de passe oublié.
- **Le stockage de fichiers** : images, documents.
- **Une API** générée automatiquement pour que ton site lise et écrive les données.

Le tout avec une offre gratuite pour démarrer (vérifie les limites actuelles sur leur site).

## Pourquoi c'est pratique quand on débute

- Les outils d'IA savent très bien l'utiliser : il suffit de leur demander.
- Le tableau de bord permet de **voir tes données** comme dans un tableur.
- Tu n'as pas de serveur à gérer.

## Le réglage le plus important : la sécurité des lignes

Supabase utilise des **règles de sécurité par ligne** (Row Level Security, RLS). Elles décident **qui peut voir et modifier quoi**. Exemple : « un coiffeur ne voit que ses propres rendez-vous ».

C'est le point à ne jamais oublier. Sans ces règles, un utilisateur malin pourrait lire les données des autres. Demande explicitement à l'IA :

> « Active la sécurité par ligne sur toutes les tables, et écris les règles pour que chaque utilisateur ne voie et ne modifie que ses propres données. »

Puis vérifie avec deux comptes de test différents.

## Les autres réglages à faire

- **Les adresses autorisées** : dans les réglages d'authentification, indique l'adresse de ton site pour que les liens de connexion et de réinitialisation fonctionnent.
- **Les e-mails** : personnalise les e-mails de confirmation, et configure un service d'envoi pour ne pas être limité.
- **La clé secrète** : la clé « service role » ou « secret » ne doit **jamais** apparaître dans le code du navigateur. Elle reste côté serveur.

## Et les paiements ?

Supabase ne gère pas les paiements : pour ça, on l'associe généralement à Stripe. Ton site enregistre dans Supabase qui a payé, grâce aux notifications de Stripe. Voir [Stripe pour débutant](/blog/stripe-abonnements-debutant).`,
    faq: [
      {
        q: "Supabase est-il gratuit ?",
        a: "Supabase propose une offre gratuite pour démarrer, avec des limites. Des offres payantes existent pour les projets qui grandissent. Vérifie les conditions actuelles sur leur site.",
      },
      {
        q: "Qu'est-ce que le RLS dans Supabase ?",
        a: "Le Row Level Security, ou sécurité par ligne : des règles qui décident quels utilisateurs peuvent lire ou modifier chaque ligne d'une table. Indispensable pour protéger les données.",
      },
    ],
  },
  {
    slug: "nom-et-nom-de-domaine-saas",
    title: "Choisir le nom et le nom de domaine de ton SaaS",
    description:
      "Comment trouver un bon nom pour ton SaaS et réserver le bon nom de domaine : critères, extensions (.fr, .com, .app), vérifications légales et erreurs à éviter.",
    category: "lancer",
    date: "2026-12-20",
    body: `Le nom de ton SaaS sera dans chaque vidéo, chaque e-mail et chaque facture. Pas besoin d'y passer des semaines, mais quelques règles simples évitent de le regretter.

## Les qualités d'un bon nom

- **Facile à dire et à écrire** : si tu dois l'épeler à chaque fois, c'est raté.
- **Court** : deux ou trois syllabes, idéalement.
- **Évocateur** : il peut suggérer le bénéfice (RelanceFacture, AgendaPro) ou être une marque abstraite.
- **Disponible** : en nom de domaine et sur les réseaux sociaux.

## Descriptif ou abstrait ?

- **Descriptif** (« RelanceFacture ») : on comprend tout de suite, utile pour le référencement et une niche précise.
- **Abstrait** (« Pennylane », « Notion ») : plus mémorable à terme, mais demande plus d'explications au début.

Pour un premier SaaS de niche, un nom descriptif est souvent plus efficace.

## Le nom de domaine

### Quelle extension ?
- **.fr** : rassurant pour une cible française.
- **.com** : universel, mais souvent déjà pris.
- **.app**, **.io**, **.co** : courants pour les logiciels.

Si ta cible est en France, un **.fr** est un excellent choix.

### Où l'acheter ?
Chez un registraire (OVH, IONOS, Gandi, ou directement chez certains hébergeurs). Compte en général une dizaine d'euros par an pour un .fr ou un .com, selon le registraire.

### Les astuces
- Ajoute un mot si le nom seul est pris : « get », « app », « hq » (getrelance.fr).
- Évite les tirets et les chiffres.
- Prends aussi les variantes proches si elles ne coûtent pas cher.

## Les vérifications à faire

1. **La marque** : vérifie sur la base de l'INPI qu'aucune marque identique n'existe dans ton domaine d'activité.
2. **Les réseaux sociaux** : vérifie que le nom est libre sur TikTok et Instagram.
3. **La recherche Google** : assure-toi que le nom n'est pas déjà associé à un concurrent ou à quelque chose de gênant.

## Les erreurs à éviter

- **Un nom trop proche d'une grande marque** : risque juridique.
- **Un nom imprononçable** en français.
- **Bloquer ton lancement** pour trouver le nom parfait : tu peux toujours changer de nom plus tard, surtout au début.

Une fois ton nom choisi, place-le sur une [landing page claire](/blog/landing-page-saas).`,
    faq: [
      {
        q: "Quelle extension choisir pour un SaaS français ?",
        a: "Un .fr est rassurant pour une cible française. Le .com est universel mais souvent pris. Les extensions .app ou .io sont courantes pour les logiciels.",
      },
      {
        q: "Combien coûte un nom de domaine ?",
        a: "Généralement une dizaine d'euros par an pour un .fr ou un .com, selon le registraire. Certaines extensions sont plus chères.",
      },
    ],
  },
  {
    slug: "obligations-legales-saas",
    title: "CGV, mentions légales, RGPD : le minimum légal pour un SaaS en France",
    description:
      "Les obligations légales d'un SaaS vendu en France : mentions légales, CGV, droit de rétractation, RGPD, cookies et médiateur. Ce qu'il faut avant d'encaisser.",
    category: "lancer",
    date: "2026-12-22",
    body: `Vendre un abonnement en ligne en France impose quelques obligations. Elles ne sont pas compliquées, mais il vaut mieux les mettre en place avant d'encaisser ton premier client.

> Cet article donne des repères généraux, pas un conseil juridique. Pour ta situation précise, renseigne-toi sur service-public.fr, auprès de la CNIL ou d'un professionnel.

## Les mentions légales

Tout site professionnel doit afficher des mentions légales : ton identité (nom ou raison sociale), ton statut et ton numéro SIRET, ton adresse, un moyen de contact, et l'hébergeur du site.

## Les conditions générales de vente (CGV)

Si tu vends à des particuliers, les CGV sont obligatoires. Elles décrivent :

- le service vendu et son prix ;
- la durée de l'abonnement et son renouvellement ;
- les modalités de paiement et de résiliation ;
- le droit de rétractation ;
- le traitement des réclamations et le médiateur.

Le client doit pouvoir les lire **et les accepter** avant de payer.

## Le droit de rétractation

Pour une vente à distance à un particulier, il existe en principe un droit de rétractation de 14 jours. Pour un service numérique fourni immédiatement, des règles particulières s'appliquent si le client demande expressément à commencer tout de suite et reconnaît renoncer à ce droit : renseigne-toi sur ces conditions et applique-les correctement dans ton parcours de paiement.

## Le médiateur de la consommation

Si tu vends à des particuliers, tu dois leur proposer un médiateur de la consommation en cas de litige, et l'indiquer dans tes CGV.

## Le RGPD (données personnelles)

Ton SaaS collecte au minimum des e-mails : le RGPD s'applique.

- Une **politique de confidentialité** qui explique quelles données tu collectes, pourquoi, combien de temps, et avec qui elles sont partagées (hébergeur, paiement, e-mails).
- Le droit pour chacun d'**accéder** à ses données et de les **supprimer**.
- Des données **protégées** : accès limité, mots de passe chiffrés, règles de sécurité dans ta base. Voir [Supabase pour débutant](/blog/supabase-debutant).

## Les cookies

Les cookies de mesure d'audience ou publicitaires demandent en général un consentement préalable. Les cookies strictement nécessaires (connexion, panier) n'en demandent pas. Le site de la CNIL détaille les règles.

## Les ventes aux professionnels

Pour une cible uniquement professionnelle (B2B), certaines règles diffèrent : pas de droit de rétractation de consommateur, CGV adaptées. Les mentions légales et le RGPD restent obligatoires.

## La checklist avant d'encaisser

- Mentions légales en pied de page.
- CGV acceptées avant le paiement.
- Politique de confidentialité.
- Prix et renouvellement affichés clairement.
- Résiliation facile.

Une fois en règle, concentre-toi sur l'essentiel : [trouver tes premiers clients](/blog/trouver-ses-premiers-clients-saas).`,
    faq: [
      {
        q: "Un SaaS doit-il avoir des CGV ?",
        a: "Oui si tu vends à des particuliers : les CGV sont obligatoires et doivent être acceptées avant le paiement. Pour une cible professionnelle, elles sont fortement recommandées.",
      },
      {
        q: "Le RGPD s'applique-t-il à un petit SaaS ?",
        a: "Oui, dès que tu collectes des données personnelles comme des e-mails. Il faut une politique de confidentialité, protéger les données et permettre leur suppression.",
      },
    ],
  },
];
