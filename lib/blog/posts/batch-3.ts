import type { BlogPost } from "@/lib/blog/types";

export const POSTS_3: BlogPost[] = [
  {
    slug: "valider-une-idee-de-saas",
    title: "Valider une idée de SaaS avant de la construire : la méthode en 7 jours",
    description:
      "Avant de construire ton SaaS, vérifie que des gens paieront. La méthode en 7 jours : interviews, page de présentation, précommandes. Sans perdre des mois.",
    category: "idees",
    date: "2026-11-24",
    body: `Construire un SaaS que personne ne veut, c'est l'erreur la plus fréquente et la plus coûteuse. Même avec l'IA, tu peux perdre des semaines sur un outil sans clients. La solution : **valider avant de construire**. Voici une méthode en 7 jours.

## Jours 1 et 2 : écrire ton hypothèse

Résume ton idée en une phrase :

> « J'aide [cible précise] à [résultat] sans [douleur actuelle], pour [prix] par mois. »

Exemple : « J'aide les coiffeurs indépendants à réduire les rendez-vous oubliés grâce à des rappels SMS automatiques, pour 19 € par mois. »

Puis liste ce qui doit être vrai pour que ça marche : le problème existe, il est assez douloureux, ta cible paie déjà pour des outils, et tu peux la joindre.

## Jours 2 à 4 : parler à 10 personnes

C'est l'étape que tout le monde saute, et la plus importante. Trouve 10 personnes de ta cible et pose des questions **sur leur passé, pas sur ton idée** :

1. « Raconte-moi la dernière fois que [problème] t'est arrivé. »
2. « Qu'est-ce que tu as fait pour le régler ? »
3. « Combien ça t'a coûté, en temps ou en argent ? »
4. « Tu utilises quoi aujourd'hui ? Qu'est-ce qui t'énerve dedans ? »

Évite « Est-ce que tu utiliserais mon outil ? » : tout le monde répond oui par politesse, et ça ne veut rien dire.

### Les signaux positifs
- Ils décrivent le problème avec émotion.
- Ils ont déjà essayé des solutions.
- Ils te demandent quand ce sera disponible.

### Les signaux négatifs
- « C'est une bonne idée » sans exemple concret.
- Ils ne se souviennent pas de la dernière fois que c'est arrivé.

## Jours 4 et 5 : une page de présentation

Crée une page simple (l'IA la fait en quelques minutes) avec :

- le problème en une phrase ;
- ta solution en une phrase ;
- le prix ;
- un bouton « Je veux être prévenu » ou « Je réserve ma place ».

Partage-la à ta cible : groupes spécialisés, messages directs, une vidéo courte.

## Jours 5 à 7 : demander un engagement

Le test le plus fiable reste **l'argent**. Propose aux personnes intéressées une précommande à prix réduit, ou un acompte remboursable. Une personne qui paie, même 10 €, vaut cent personnes qui disent « super idée ».

## Comment interpréter les résultats

- **Plusieurs personnes paient ou s'engagent** : construis une première version simple, vite.
- **Beaucoup d'intérêt mais aucun paiement** : ajuste le prix, la cible ou la promesse, puis reteste.
- **Peu d'intérêt** : change d'idée. Tu as perdu une semaine, pas six mois.

Une fois ton idée validée, passe à la construction avec [créer un SaaS sans savoir coder](/blog/creer-un-saas-sans-coder).`,
    faq: [
      {
        q: "Comment valider une idée de SaaS rapidement ?",
        a: "Parle à une dizaine de personnes de ta cible sur leurs problèmes réels, présente ton offre sur une page simple, puis demande un engagement concret comme une précommande.",
      },
      {
        q: "Combien de personnes interroger pour valider une idée ?",
        a: "Une dizaine d'entretiens suffit souvent à voir si le problème est réel. Le meilleur signal reste que certaines personnes acceptent de payer.",
      },
    ],
  },
  {
    slug: "micro-saas",
    title: "Micro-SaaS : définition, exemples et comment en lancer un seul",
    description:
      "Un micro-SaaS est un petit logiciel par abonnement, géré par une seule personne, pour une niche précise. Définition, exemples et méthode pour en lancer un.",
    category: "idees",
    date: "2026-11-26",
    body: `Un micro-SaaS, c'est un SaaS **volontairement petit** : une personne (ou deux), une niche précise, un problème précis. Pas de levée de fonds, pas d'équipe, pas d'ambition de devenir le prochain géant. Juste un outil utile qui rapporte chaque mois.

## Ce qui distingue un micro-SaaS

- **Une niche étroite** : « les photographes de mariage », pas « les créatifs ».
- **Une fonction principale** : il fait une chose, et la fait bien.
- **Géré seul** : construction, support et marketing par la même personne.
- **Rentable vite** : peu de coûts, donc rentable dès les premiers clients.
- **Objectif raisonnable** : quelques milliers d'euros par mois, pas des millions.

## Pourquoi c'est le format idéal pour débuter

### Les gros acteurs ne s'y intéressent pas
Une niche de quelques milliers de clients potentiels est trop petite pour une grande entreprise, mais largement suffisante pour toi. Avec 100 clients à 29 €, tu fais déjà 2 900 € par mois.

### Tu peux parler directement à tes clients
Dans une niche, tes clients se connaissent, fréquentent les mêmes groupes, lisent les mêmes médias. Le bouche-à-oreille va vite.

### La construction est accessible
Avec les outils d'IA actuels, une seule fonction bien faite se construit sans équipe. Voir [vibe coding](/blog/vibe-coding).

## Des exemples de micro-SaaS

- Un outil qui transforme les avis Google d'un restaurant en publications Instagram.
- Un générateur de contrats pour photographes freelances.
- Un suivi des cotisations pour petits clubs de sport.
- Un planificateur de tournées pour infirmiers libéraux.
- Une extension qui résume les e-mails clients pour les e-commerçants.

## Comment trouver ta niche

1. **Pars d'un métier que tu connais** ou d'une communauté dont tu fais partie.
2. **Repère une tâche répétitive** que tout le monde fait à la main ou dans un tableur.
3. **Vérifie qu'ils paient déjà** des outils (même mal adaptés).
4. **Vérifie que tu peux les joindre** : groupes, salons, annuaires.

Pour plus d'inspiration, consulte nos [40 idées de SaaS simples](/blog/idees-de-saas-a-lancer-seul).

## Les pièges du micro-SaaS

- **Une niche trop petite** : s'il n'existe que 50 clients potentiels en France, ce sera difficile.
- **Une niche qui ne paie pas** : certaines communautés sont habituées au gratuit.
- **Trop de fonctions** : le risque est de transformer ton micro-SaaS en usine à gaz pour faire plaisir à chaque client.

## Par où commencer

Choisis ta niche, [valide ton idée en 7 jours](/blog/valider-une-idee-de-saas), puis construis la version la plus simple possible. Ton but n'est pas d'avoir le meilleur produit du marché, mais le plus adapté à ta niche.`,
    faq: [
      {
        q: "Qu'est-ce qu'un micro-SaaS ?",
        a: "Un petit logiciel par abonnement, géré par une seule personne, qui règle un problème précis pour une niche précise. Il vise la rentabilité rapide plutôt que la croissance à tout prix.",
      },
      {
        q: "Combien rapporte un micro-SaaS ?",
        a: "Cela varie énormément. Le calcul reste simple : prix de l'abonnement fois nombre de clients. 100 clients à 29 € par mois font 2 900 € de revenu mensuel.",
      },
    ],
  },
  {
    slug: "ecrire-un-prompt-pour-creer-une-application",
    title: "Écrire le prompt qui construit ton application : la méthode et un modèle",
    description:
      "Le prompt est le plan de ton application. Comment l'écrire pour que l'IA construise ton SaaS du premier coup, avec un modèle à copier et les erreurs à éviter.",
    category: "creer",
    date: "2026-11-28",
    body: `Quand tu crées une application avec l'IA, ton prompt joue le rôle du **cahier des charges**. Un prompt flou donne une application floue. Un prompt précis te fait gagner des heures de corrections.

## Ce qu'un bon prompt doit contenir

### 1. Le contexte
Qui utilise l'application, et pourquoi ? « Une application pour les coiffeurs indépendants qui veulent réduire les rendez-vous oubliés. »

### 2. Les utilisateurs et leurs rôles
Qui se connecte ? Le coiffeur seulement, ou aussi ses clients ? Qui peut voir quoi ?

### 3. Les pages
Liste chaque page : accueil, inscription, connexion, tableau de bord, paramètres, paiement.

### 4. Les actions sur chaque page
Sur le tableau de bord : « voir les rendez-vous de la semaine, ajouter un rendez-vous (nom, téléphone, date, heure), supprimer un rendez-vous ».

### 5. Les règles
« Un SMS est envoyé automatiquement la veille à 18 h. Chaque coiffeur ne voit que ses propres rendez-vous. »

### 6. Le style
« Design simple et moderne, couleurs claires, utilisable sur téléphone en priorité, textes en français. »

### 7. La technique (si tu sais ce que tu veux)
« Base de données et comptes utilisateurs avec Supabase, paiements avec Stripe. »

## Un modèle à copier

> Crée une application web en français pour [cible]. Objectif : [résultat principal]. Les utilisateurs sont [rôles]. Pages : [liste]. Sur chaque page : [actions]. Règles : [règles métier et de sécurité]. Style : [style]. Utilise [outils]. Commence par la page [la plus importante] et explique-moi chaque étape.

## Les erreurs à éviter

- **Tout demander d'un coup** : construis d'abord le cœur (la fonction principale), puis ajoute le reste.
- **Rester vague** : « une belle page » ne veut rien dire pour l'IA. « Un titre centré, un bouton noir en dessous » oui.
- **Oublier la sécurité** : écris explicitement que chaque utilisateur ne voit que ses propres données.
- **Oublier le mobile** : précise si tes clients l'utiliseront surtout sur téléphone.

## Après le premier prompt

Le premier résultat ne sera pas parfait, et c'est normal. Teste chaque page, puis corrige **une chose à la fois** avec des demandes précises : « Sur la page Rendez-vous, le bouton Ajouter ne fonctionne pas sur iPhone. »

Ton choix d'outil compte aussi : voir notre [comparatif Lovable, Bolt, Replit et Claude Code](/blog/lovable-bolt-replit-comparatif).

> Notre questionnaire gratuit génère pour toi l'idée et le prompt de build complet, adaptés à ton profil : tu n'as plus qu'à le coller dans l'outil de ton choix.`,
    faq: [
      {
        q: "Comment écrire un bon prompt pour créer une application ?",
        a: "Décris le contexte, les utilisateurs, chaque page, les actions possibles, les règles métier et de sécurité, le style et les outils. Commence par la fonction principale.",
      },
      {
        q: "Faut-il un long prompt ?",
        a: "Il doit être complet sur l'essentiel, pas forcément long. Un prompt précis d'une page vaut mieux que trois pages vagues.",
      },
    ],
  },
  {
    slug: "creer-un-mvp-saas",
    title: "Créer le MVP de ton SaaS : ce qu'il faut garder, ce qu'il faut couper",
    description:
      "Le MVP est la version minimale de ton SaaS qui règle déjà le problème. Comment choisir ses fonctions, le construire vite et le mettre devant de vrais clients.",
    category: "lancer",
    date: "2026-11-30",
    body: `MVP signifie **Minimum Viable Product** : produit minimum viable. C'est la plus petite version de ton SaaS qui **règle déjà le problème** de ton client. Pas une maquette, pas une démo : un vrai outil, simple, que quelqu'un peut utiliser et payer.

## Pourquoi commencer petit

- Tu **lances plus vite**, donc tu apprends plus vite.
- Tu **dépenses moins** de temps sur des fonctions dont personne ne veut.
- Tes premiers clients te disent **quoi construire ensuite**.

## La méthode pour choisir tes fonctions

### 1. Écris le parcours principal
Que fait ton client du début à la fin pour obtenir le résultat promis ? Pour un outil de relance de factures : « Je m'inscris, j'ajoute une facture, l'outil relance mon client automatiquement, je vois quand il a payé. »

### 2. Garde uniquement ce parcours
Tout ce qui ne sert pas directement ce parcours attend la version 2 : statistiques avancées, mode équipe, intégrations, application mobile.

### 3. Ajoute le strict nécessaire autour
- Inscription et connexion.
- Paiement de l'abonnement.
- Une page d'accueil qui explique la promesse.

## Ce qu'on peut faire à la main au début

Beaucoup de choses peuvent être faites **par toi, manuellement**, tant que tu as peu de clients :

- la configuration du compte, faite avec le client en visio ;
- l'import de ses données ;
- certains rapports envoyés par e-mail plutôt qu'affichés dans l'outil.

Tu automatiseras plus tard ce qui prend vraiment du temps.

## Les signes que ton MVP est trop gros

- Ça fait plus de quelques semaines que tu construis sans montrer.
- Tu as plus de cinq pages principales.
- Tu n'arrives pas à expliquer ton outil en une phrase.

## Les signes que ton MVP est prêt

- Une personne extérieure arrive à obtenir le résultat promis sans ton aide.
- Le paiement fonctionne.
- Tu n'as pas honte de le montrer… ou un tout petit peu. C'est bon signe : tu ne l'as pas trop peaufiné.

## Et après

Mets ton MVP devant de vrais clients, observe comment ils l'utilisent, et améliore ce qui bloque. Pour la construction, suis notre guide [créer un SaaS sans savoir coder](/blog/creer-un-saas-sans-coder), et pour les paiements, [Stripe pour débutant](/blog/stripe-abonnements-debutant).

> Si tu n'as pas un peu honte de ta première version, tu l'as lancée trop tard.`,
    faq: [
      {
        q: "Qu'est-ce qu'un MVP pour un SaaS ?",
        a: "La plus petite version de ton logiciel qui règle déjà le problème du client et qu'il peut payer : le parcours principal, l'inscription, le paiement et une page d'accueil.",
      },
      {
        q: "Combien de temps pour créer un MVP ?",
        a: "Avec les outils d'IA, une version simple peut se construire en quelques jours à quelques semaines, selon ton temps disponible et la complexité du problème.",
      },
    ],
  },
  {
    slug: "stripe-abonnements-debutant",
    title: "Encaisser des abonnements avec Stripe : le guide pour débutant",
    description:
      "Comment encaisser les abonnements de ton SaaS avec Stripe : créer ton compte, tes produits et tes prix, la page de paiement, les frais et les erreurs à éviter.",
    category: "lancer",
    date: "2026-12-02",
    body: `Stripe est la solution de paiement la plus utilisée par les SaaS. Elle gère la carte bancaire, les abonnements, les renouvellements, les factures et les échecs de paiement. Voici comment l'utiliser quand tu débutes.

## Étape 1 : créer ton compte

Rends-toi sur stripe.com et crée un compte. Pour recevoir de l'argent, Stripe te demandera :

- ton identité ;
- ton statut (par exemple ton SIRET si tu es en [micro-entreprise](/blog/statut-micro-entreprise-saas)) ;
- le compte bancaire sur lequel recevoir les virements.

Tu peux tout tester en **mode test** avant d'avoir terminé ces étapes.

## Étape 2 : créer ton produit et tes prix

Dans le tableau de bord, crée un **produit** (ton SaaS), puis un ou plusieurs **prix** :

- un prix mensuel récurrent (par exemple 29 € par mois) ;
- éventuellement un prix annuel (par exemple 290 € par an).

## Étape 3 : la page de paiement

La solution la plus simple est **Stripe Checkout** : une page de paiement hébergée par Stripe, sécurisée, qui gère la carte, Apple Pay ou Google Pay selon ta configuration. Ton site envoie le client vers cette page, il paie, puis il revient chez toi.

Avec un outil d'IA, il suffit de demander : « Ajoute un bouton S'abonner qui ouvre Stripe Checkout pour le prix mensuel, puis donne l'accès premium à l'utilisateur une fois le paiement confirmé. »

## Étape 4 : donner l'accès au bon moment

Le point technique à ne pas rater : ton application doit savoir **quand un client a payé** et **quand il arrête**. Stripe envoie ces informations à ton site via des **webhooks** (paiement réussi, abonnement annulé, paiement échoué). Demande à l'IA de les gérer : c'est ce qui active et désactive l'accès automatiquement.

## Étape 5 : le portail client

Stripe propose un **portail client** où tes abonnés changent leur carte, téléchargent leurs factures ou résilient. Active-le : c'est plus simple pour eux, et une résiliation facile rassure à l'achat.

## Les frais

Stripe prélève une commission sur chaque paiement. Pour une carte européenne standard, elle est de l'ordre de **1,5 % + 0,25 €** par transaction (vérifie la grille actuelle sur la page tarifs de Stripe). Pas d'abonnement mensuel pour l'offre standard.

## Les erreurs à éviter

- **Rester en mode test** en croyant être en ligne : vérifie que tes clés sont bien les clés « live ».
- **Donner l'accès sans vérifier le paiement** : l'accès doit dépendre de la confirmation Stripe, pas du simple clic.
- **Oublier les échecs de paiement** : active les relances automatiques de Stripe pour les cartes refusées.
- **Ne pas afficher clairement le prix et le renouvellement** : c'est une obligation pour les ventes aux particuliers, et ça évite les litiges.

## Et ensuite

Une fois les paiements en place, suis ton revenu mensuel récurrent, ton [MRR](/blog/mrr-c-est-quoi). C'est le chiffre qui dit si ton SaaS grandit.`,
    faq: [
      {
        q: "Stripe est-il adapté aux abonnements ?",
        a: "Oui, Stripe gère les abonnements mensuels et annuels, les renouvellements, les factures, les échecs de paiement et un portail client pour résilier ou changer de carte.",
      },
      {
        q: "Combien coûte Stripe ?",
        a: "L'offre standard fonctionne à la commission par transaction, de l'ordre de 1,5 % + 0,25 € pour une carte européenne standard. Vérifie la grille tarifaire en vigueur sur le site de Stripe.",
      },
    ],
  },
];
