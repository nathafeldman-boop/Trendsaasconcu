import type { BlogPost } from "@/lib/blog/types";

export const POSTS_6: BlogPost[] = [
  {
    slug: "erreurs-premier-saas",
    title: "12 erreurs qui font échouer un premier SaaS (et comment les éviter)",
    description:
      "Construire sans valider, viser tout le monde, cacher le prix, attendre la perfection : les 12 erreurs les plus fréquentes d'un premier SaaS, et comment les éviter.",
    category: "lancer",
    date: "2026-12-24",
    body: `La plupart des premiers SaaS n'échouent pas à cause de la technique. Ils échouent à cause de décisions prises au début. Voici les 12 erreurs les plus fréquentes.

## Sur l'idée

### 1. Construire sans parler aux clients
Des semaines de construction pour découvrir que personne n'a vraiment le problème. La solution : [valider en 7 jours](/blog/valider-une-idee-de-saas).

### 2. Viser tout le monde
« Un outil pour toutes les entreprises » ne parle à personne. Choisis une cible précise que tu peux décrire en une phrase.

### 3. Choisir une idée sans accès aux clients
Une bonne idée dans un milieu où tu ne connais personne est beaucoup plus difficile à vendre.

## Sur le produit

### 4. Trop de fonctions dans la première version
Chaque fonction en plus retarde le lancement et complique l'outil. Voir [créer ton MVP](/blog/creer-un-mvp-saas).

### 5. Attendre la perfection
Ton produit ne sera jamais parfait. Lance quand le parcours principal fonctionne.

### 6. Négliger la sécurité des données
Chaque utilisateur ne doit voir que ses données. Vérifie-le avec deux comptes de test.

## Sur l'argent

### 7. Un prix trop bas
Un prix bas attire des clients peu engagés et ne finance rien. Voir [quel prix pour ton SaaS](/blog/quel-prix-pour-un-saas).

### 8. Cacher le prix
Les visiteurs pressés partent. Affiche-le clairement.

### 9. Ignorer les départs
Un client perdu doit être remplacé. Surveille ton [churn](/blog/churn-saas) dès le début.

## Sur la vente

### 10. Attendre que les clients viennent seuls
Personne ne connaît ton SaaS au lancement. Les [premiers clients](/blog/trouver-ses-premiers-clients-saas) se trouvent à la main.

### 11. Payer de la publicité trop tôt
Sans savoir quel message convainc, tu paies pour apprendre. Commence par des conversations et des vidéos.

### 12. Abandonner trop vite
Beaucoup s'arrêtent après quelques semaines sans résultat. Les premiers clients demandent souvent plus de temps et de tentatives qu'on ne l'imagine. Ajuste ton message, ta cible ou ton prix avant d'abandonner l'idée.

## La règle qui évite la plupart de ces erreurs

Parle à tes clients **chaque semaine**. Presque toutes ces erreurs viennent du fait de décider seul, sans retour du terrain.`,
    faq: [
      {
        q: "Pourquoi la plupart des SaaS échouent-ils ?",
        a: "Le plus souvent à cause d'un problème mal validé, d'une cible trop large ou d'un manque d'efforts de vente, plutôt qu'à cause de la technique.",
      },
    ],
  },
  {
    slug: "saas-b2b-ou-b2c",
    title: "SaaS B2B ou B2C : lequel choisir pour débuter ?",
    description:
      "Vendre aux professionnels (B2B) ou aux particuliers (B2C) ? Prix, nombre de clients, rythme de vente et fidélité : comparaison pour choisir ton premier SaaS.",
    category: "idees",
    date: "2026-12-26",
    body: `Avant de choisir ton idée, une question structure tout le reste : tu vends à des **professionnels** (B2B, business to business) ou à des **particuliers** (B2C, business to consumer) ?

## Le B2B : vendre aux professionnels

**Exemples** : un outil de rappel de rendez-vous pour coiffeurs, un suivi des factures pour freelances.

**Avantages**
- **Prix plus élevés** : un professionnel paie plus volontiers 29 ou 49 € par mois si l'outil lui fait gagner du temps ou de l'argent.
- **Moins de clients nécessaires** : 35 clients à 29 € font environ 1 000 € par mois.
- **Clients plus fidèles** : un outil intégré au travail quotidien est rarement abandonné.
- **Achat rationnel** : si tu montres le gain, la décision est logique.

**Inconvénients**
- Il faut comprendre un métier.
- La vente demande parfois des démos et des relances.

## Le B2C : vendre aux particuliers

**Exemples** : un planificateur de repas, une appli de révision pour étudiants.

**Avantages**
- **Marché immense** : tout le monde est un client potentiel.
- **Viralité** : les particuliers partagent plus facilement sur les réseaux.
- **Achat rapide** : pas de validation interne.

**Inconvénients**
- **Prix bas** : souvent entre 5 et 15 € par mois.
- **Beaucoup de clients nécessaires** : 112 clients à 9 € pour 1 000 € par mois.
- **Départs plus fréquents** : les particuliers résilient plus facilement.
- **Obligations plus nombreuses** pour la vente aux consommateurs (CGV, rétractation, médiateur).

## Notre conseil pour un premier SaaS

Pour la plupart des débutants, le **B2B de niche** est le chemin le plus court vers des revenus réguliers : moins de clients à trouver, des prix plus élevés et une meilleure fidélité. Le B2C peut très bien marcher, surtout si tu sais créer du contenu viral, mais demande beaucoup plus de volume.

Pour faire tes calculs, lis [combien de clients pour 1 000 € par mois](/blog/combien-de-clients-pour-1000-euros-par-mois), et pour trouver des idées des deux types, nos [40 idées de SaaS](/blog/idees-de-saas-a-lancer-seul).`,
    faq: [
      {
        q: "Quelle différence entre SaaS B2B et B2C ?",
        a: "Un SaaS B2B se vend aux professionnels, souvent plus cher et avec des clients fidèles. Un SaaS B2C se vend aux particuliers, moins cher, avec plus de volume nécessaire.",
      },
      {
        q: "Le B2B est-il plus facile pour débuter ?",
        a: "Souvent oui : il faut moins de clients pour atteindre un revenu donné, et ils restent plus longtemps. Il faut en revanche bien comprendre le métier de ta cible.",
      },
    ],
  },
  {
    slug: "combien-de-temps-pour-creer-un-saas",
    title: "Combien de temps pour créer un SaaS ? Un planning réaliste",
    description:
      "De l'idée au premier client : combien de temps faut-il pour créer un SaaS avec l'IA ? Un planning réaliste semaine par semaine, selon ton temps disponible.",
    category: "creer",
    date: "2026-12-28",
    body: `« En combien de temps je peux lancer mon SaaS ? » La réponse dépend surtout de deux choses : **ton temps disponible** et **la simplicité de ton idée**. Voici un planning réaliste pour quelqu'un qui y consacre environ une à deux heures par jour.

## Semaine 1 : l'idée

- Lister des problèmes réels autour de toi.
- Choisir une cible précise.
- Écrire ta promesse en une phrase.

Voir [comment trouver une idée de SaaS](/blog/trouver-une-idee-de-saas).

## Semaine 2 : la validation

- Parler à une dizaine de personnes de ta cible.
- Mettre en ligne une page de présentation simple.
- Demander un engagement (précommande, inscription).

Voir [valider une idée de SaaS en 7 jours](/blog/valider-une-idee-de-saas).

## Semaines 3 et 4 : la construction du MVP

- Écrire ton prompt de build.
- Construire le parcours principal avec l'IA.
- Ajouter l'inscription et le paiement.
- Tester avec deux ou trois personnes.

Voir [créer ton MVP](/blog/creer-un-mvp-saas).

## Semaine 5 : le lancement

- Mettre ton SaaS en ligne sur ton nom de domaine.
- Contacter les personnes intéressées pendant la validation.
- Publier tes premières vidéos de démonstration.

## Semaines 6 à 12 : les premiers clients

C'est la phase la plus longue, et la plus importante. Chaque jour : des conversations, des vidéos, des améliorations basées sur les retours. Voir [trouver tes 10 premiers clients](/blog/trouver-ses-premiers-clients-saas).

## Ce qui accélère

- **Une idée simple** : une seule fonction principale.
- **Un accès direct aux clients** : tu connais déjà ta cible.
- **Plus de temps** : à plein temps, ce planning peut être divisé par deux ou trois.
- **Un bon prompt** dès le départ, qui t'évite des allers-retours.

## Ce qui ralentit

- Ajouter des fonctions avant d'avoir des clients.
- Changer d'idée chaque semaine.
- Peaufiner le design au lieu de vendre.

> La construction n'est plus le goulot d'étranglement : avec l'IA, elle prend des jours. Trouver des clients prend des semaines. Planifie en conséquence.`,
    faq: [
      {
        q: "Combien de temps faut-il pour créer un SaaS ?",
        a: "Avec l'IA et une à deux heures par jour, compte quelques semaines pour l'idée, la validation et un premier MVP, puis plusieurs semaines pour trouver les premiers clients.",
      },
    ],
  },
  {
    slug: "exemples-de-saas",
    title: "Exemples de SaaS : des géants aux petits outils de niche",
    description:
      "Des exemples de SaaS connus, dont plusieurs nés en France, et des exemples de petits SaaS de niche. Ce qu'ils ont en commun et ce que tu peux en apprendre.",
    category: "idees",
    date: "2026-12-30",
    body: `Pour comprendre ce qu'est un SaaS, rien ne vaut des exemples. Des plus connus aux plus modestes, ils partagent tous le même principe : **un logiciel en ligne, payé par abonnement, qui règle un problème précis**.

## Des SaaS connus dans le monde

- **Notion** : prise de notes et organisation du travail.
- **Canva** : création de visuels en ligne.
- **Slack** : messagerie pour les équipes.
- **Shopify** : création de boutiques en ligne.
- **Zoom** : visioconférence.

## Des SaaS nés en France

- **Doctolib** : la prise de rendez-vous en ligne, avec un logiciel que les praticiens paient par abonnement.
- **PayFit** : la gestion de la paie pour les entreprises.
- **Pennylane** : la comptabilité et la gestion financière des entreprises.
- **Lemlist** : l'automatisation de la prospection par e-mail.
- **Brevo** (ex-Sendinblue) : l'e-mail marketing et la relation client.

## Ce que ces exemples ont en commun

1. **Un problème quotidien** : prendre rendez-vous, payer des salaires, envoyer des e-mails.
2. **Un client qui paie** pour gagner du temps ou de l'argent.
3. **Un usage régulier** : on s'en sert chaque jour ou chaque semaine.
4. **Un démarrage ciblé** : beaucoup ont commencé par une cible précise avant de s'élargir.

## Les petits SaaS de niche

Tu n'entendras jamais parler de la plupart des SaaS rentables. Ce sont des outils discrets, souvent créés par une ou deux personnes, pour une niche précise. Quelques types qu'on retrouve souvent :

- des outils de réservation pour un métier précis ;
- des générateurs de documents (contrats, devis, annonces) ;
- des tableaux de bord qui regroupent des données d'autres outils ;
- des automatisations qui relient deux logiciels ;
- des extensions de navigateur qui font gagner du temps sur une tâche.

C'est exactement le type de SaaS qu'on peut lancer seul aujourd'hui. Voir [micro-SaaS](/blog/micro-saas) et nos [40 idées de SaaS](/blog/idees-de-saas-a-lancer-seul).

## Ce que tu peux en retenir

Tu n'as pas besoin de réinventer Doctolib. Tu as besoin de trouver un problème précis que les gros acteurs ignorent, et de le régler mieux que quiconque pour une petite communauté.`,
    faq: [
      {
        q: "Quels sont des exemples de SaaS français ?",
        a: "Doctolib, PayFit, Pennylane, Lemlist ou Brevo sont des exemples connus de logiciels en ligne payés par abonnement, nés en France.",
      },
      {
        q: "Un petit SaaS peut-il être rentable ?",
        a: "Oui. Beaucoup de SaaS de niche, créés par une ou deux personnes, sont rentables avec quelques dizaines ou centaines de clients.",
      },
    ],
  },
  {
    slug: "claude-code-debutant",
    title: "Claude Code pour débutant : construire ton SaaS avec une IA qui code",
    description:
      "Claude Code est une IA qui travaille directement dans ton projet. Comment démarrer quand on n'a jamais codé, comment lui parler, et les bonnes pratiques.",
    category: "creer",
    date: "2027-01-01",
    body: `Claude Code est un assistant d'Anthropic qui **travaille directement sur les fichiers de ton projet** : il lit ton code, le modifie, lance des commandes et t'explique ce qu'il fait. C'est un des outils les plus puissants pour construire un SaaS avec l'IA, et il est accessible même si tu n'as jamais codé.

## En quoi c'est différent des autres outils

Des outils comme Lovable ou Bolt génèrent une application dans leur propre interface. Claude Code, lui, travaille **sur ton projet**, où qu'il soit. Résultat :

- il comprend tout le projet avant de modifier quelque chose ;
- il peut corriger un bug en cherchant sa cause dans plusieurs fichiers ;
- le code t'appartient, et tu l'héberges où tu veux.

Voir notre [comparatif des outils IA](/blog/lovable-bolt-replit-comparatif).

## Comment démarrer

1. Installe Claude Code en suivant la documentation officielle (il existe dans le terminal, dans certains éditeurs de code et dans une version web).
2. Crée un dossier pour ton projet.
3. Donne-lui ton **prompt de build** : qui utilise l'outil, les pages, les actions, les règles. Voir [écrire le prompt qui construit ton application](/blog/ecrire-un-prompt-pour-creer-une-application).
4. Laisse-le proposer un plan, valide-le, puis laisse-le construire.

## Comment bien lui parler

### Explique le résultat, pas la technique
« Je veux qu'un coiffeur voie ses rendez-vous de la semaine sur une page, triés par jour » suffit. Il choisit comment le faire.

### Une demande à la fois
Une fonction, on teste, puis la suivante.

### Décris précisément les bugs
« Quand je clique sur Enregistrer, la page se recharge et le rendez-vous n'apparaît pas » l'aide bien plus que « ça marche pas ».

### Demande-lui d'expliquer
« Explique-moi simplement ce que tu viens de changer » : tu apprends au passage, et tu gardes le contrôle de ton projet.

## Les bonnes pratiques

- **Sauvegarde régulièrement** ton projet (avec Git, que Claude Code peut gérer pour toi) pour pouvoir revenir en arrière.
- **Teste toi-même** chaque fonction, comme un client.
- **Demande une vérification de sécurité** : « Vérifie que chaque utilisateur ne peut voir que ses propres données. »
- **Garde tes clés secrètes hors du code** : Claude Code sait utiliser des variables d'environnement, demande-le-lui.

## Ce qu'il ne fera pas à ta place

Claude Code construit ton logiciel, mais il ne trouvera pas tes clients. Une fois ton MVP prêt, passe à la vente : [trouver tes 10 premiers clients](/blog/trouver-ses-premiers-clients-saas).`,
    faq: [
      {
        q: "Claude Code est-il adapté aux débutants ?",
        a: "Oui, à condition d'accepter d'apprendre quelques bases comme ouvrir un terminal. Claude Code explique chaque étape et peut construire un projet complet à partir de tes instructions.",
      },
      {
        q: "Quelle différence entre Claude Code et Lovable ?",
        a: "Lovable génère une application dans sa propre interface, très visuelle. Claude Code travaille directement sur les fichiers de ton projet, avec plus de contrôle sur un projet qui grandit.",
      },
    ],
  },
];
