import type { BlogPost } from "@/lib/blog/types";

export const POSTS_1: BlogPost[] = [
  {
    slug: "c-est-quoi-un-saas",
    title: "C'est quoi un SaaS ? Définition simple, exemples et comment ça rapporte",
    description:
      "Un SaaS, c'est un logiciel en ligne payé par abonnement. Définition simple, exemples connus, et pourquoi c'est le business idéal pour se lancer seul avec l'IA.",
    category: "creer",
    date: "2026-11-22",
    body: `Tu as sûrement déjà utilisé un SaaS aujourd'hui sans le savoir. Netflix, Canva, Notion, Doctolib côté médecin : ce sont tous des logiciels que tu utilises dans ton navigateur ou sur une appli, et que quelqu'un paie chaque mois. C'est exactement ça, un SaaS.

## La définition en une phrase

SaaS veut dire **Software as a Service**, « logiciel en tant que service ». Au lieu d'acheter un logiciel une fois et de l'installer, le client y accède en ligne et paie un **abonnement**, souvent mensuel. Tant qu'il trouve l'outil utile, il continue de payer.

## Ce qui rend le modèle si intéressant

### Des revenus qui reviennent chaque mois
Un client qui paie 29 € par mois te rapporte 29 € ce mois-ci, puis le mois prochain, puis le suivant. Chaque nouveau client s'ajoute aux précédents. C'est ce qu'on appelle le revenu récurrent, ou [MRR](/blog/mrr-c-est-quoi).

### Pas de stock, pas de livraison
Tu ne fabriques rien et tu n'expédies rien. Le même logiciel sert 10 clients ou 1 000 clients. Tes coûts augmentent beaucoup moins vite que tes revenus.

### Tu peux le lancer seul
Avant, il fallait une équipe de développeurs. Aujourd'hui, des outils d'IA comme Claude, Lovable ou Replit construisent une grande partie du code à partir de tes instructions. On t'explique comment dans notre guide pour [créer un SaaS sans savoir coder](/blog/creer-un-saas-sans-coder).

## Des exemples de SaaS que tu connais

- **Canva** : créer des visuels en ligne, version gratuite et version payante.
- **Notion** : prendre des notes et organiser son travail, payé par équipe.
- **Doctolib** : un logiciel de prise de rendez-vous que les praticiens paient chaque mois.
- **Spotify** : techniquement un service par abonnement qui fonctionne sur le même principe.

Mais un SaaS n'a pas besoin d'être aussi gros. Un petit outil qui fait **une seule chose** pour **un seul type de client** peut très bien suffire : un outil qui relance les factures impayées des freelances, un agenda en ligne pour coiffeurs, un générateur d'annonces pour agents immobiliers. Tu trouveras plein d'exemples dans notre liste d'[idées de SaaS simples à lancer](/blog/idees-de-saas-a-lancer-seul).

## Combien ça peut rapporter

Le calcul est simple : **prix de l'abonnement × nombre de clients**. À 29 € par mois, 35 clients font environ 1 000 € par mois. 100 clients font 2 900 €. On détaille ces calculs dans [combien de clients faut-il pour 1 000 € par mois](/blog/combien-de-clients-pour-1000-euros-par-mois).

Ce n'est pas de l'argent facile : il faut trouver ces clients et les garder. Mais contrairement à beaucoup de business en ligne, chaque client gagné continue de payer les mois suivants.

## SaaS, application, site : quelle différence ?

Un **site vitrine** présente une activité. Une **application** est un outil, gratuit ou payant. Un **SaaS** est une application que des clients paient par abonnement pour résoudre un problème précis. La différence est donc surtout dans le **modèle de paiement**.

## Par où commencer

1. Trouver un problème précis que des gens paient déjà pour régler.
2. Choisir un prix d'abonnement adapté à ta cible.
3. Construire une première version simple avec l'IA.
4. Brancher les paiements (Stripe, par exemple).
5. Aller chercher tes premiers clients.

Chaque étape a son guide sur ce blog. Si tu veux gagner du temps sur la première, notre questionnaire gratuit te propose une idée adaptée à ton profil.`,
    faq: [
      {
        q: "Que veut dire SaaS ?",
        a: "SaaS signifie Software as a Service : un logiciel accessible en ligne, que le client paie par abonnement au lieu de l'acheter une fois.",
      },
      {
        q: "Faut-il savoir coder pour créer un SaaS ?",
        a: "Plus forcément. Des outils d'IA construisent une grande partie du code à partir de tes instructions. Il faut surtout savoir expliquer clairement ce que tu veux.",
      },
      {
        q: "Un SaaS, c'est forcément pour les entreprises ?",
        a: "Non. Beaucoup de SaaS visent des professionnels (B2B), mais d'autres s'adressent aux particuliers (B2C), comme les applis de sport ou d'organisation.",
      },
    ],
  },
  {
    slug: "creer-un-saas-sans-coder",
    title: "Créer un SaaS sans savoir coder en 2026 : la méthode étape par étape",
    description:
      "Tu ne sais pas coder ? Voici la méthode complète pour créer ton SaaS avec l'IA : idée, prompt, construction, paiements et premiers clients, étape par étape.",
    category: "creer",
    date: "2026-11-22",
    body: `Il y a quelques années, créer un logiciel sans savoir coder relevait du rêve. En 2026, c'est devenu une compétence accessible : il faut savoir **décrire précisément** ce que tu veux, et l'IA écrit le code. Voici la méthode, étape par étape.

## Étape 1 : choisir un problème, pas une technologie

L'erreur classique, c'est de partir d'un outil (« je veux faire une appli avec l'IA ») au lieu d'un problème (« les coiffeurs perdent des rendez-vous parce que les clients oublient »). Un SaaS qui se vend résout un problème que quelqu'un a **tous les jours** et qu'il est prêt à payer pour régler.

Pose-toi trois questions : qui a ce problème ? Comment le règle-t-il aujourd'hui ? Paie-t-il déjà quelque chose pour ça ? On détaille la méthode dans [comment trouver une idée de SaaS qui se vend](/blog/trouver-une-idee-de-saas).

## Étape 2 : réduire l'idée à une seule fonction

Ta première version doit faire **une chose, très bien**. Pas dix. Un outil de relance de factures n'a pas besoin de comptabilité, de devis et de gestion de stock. Il doit relancer les factures. C'est ton MVP, ta version minimale.

## Étape 3 : écrire le bon prompt

Le prompt, c'est le texte que tu donnes à l'IA pour qu'elle construise ton site. Un bon prompt décrit :

- **qui** utilise l'outil et pourquoi ;
- les **pages** (accueil, inscription, tableau de bord, paiement) ;
- ce que l'utilisateur **fait** sur chaque page ;
- le **style** visuel et le ton ;
- les **outils** à utiliser (base de données, paiements).

Plus tu es précis, moins tu corriges ensuite. On a écrit un guide complet pour [écrire le prompt qui construit ton application](/blog/ecrire-un-prompt-pour-creer-une-application).

## Étape 4 : choisir ton outil de construction

Plusieurs outils transforment un prompt en application :

- **Lovable** et **Bolt** : très visuels, idéaux pour démarrer vite.
- **Replit** : tout-en-un, avec hébergement intégré.
- **Claude Code** : plus puissant, il travaille directement sur les fichiers du projet.

Notre [comparatif Lovable, Bolt et Replit](/blog/lovable-bolt-replit-comparatif) t'aide à choisir.

## Étape 5 : construire, tester, corriger

Ne t'attends pas à un résultat parfait du premier coup. Le bon rythme : tu donnes le prompt, tu testes chaque page **comme si tu étais un client**, tu notes ce qui ne va pas, et tu demandes une correction à la fois. Une demande précise (« le bouton S'inscrire ne fait rien sur mobile ») marche bien mieux qu'une demande vague (« ça bug »).

## Étape 6 : brancher les paiements

Pour encaisser des abonnements, la solution la plus courante est **Stripe**. L'IA peut intégrer Stripe Checkout pour toi : le client clique sur « S'abonner », paie sur une page sécurisée, et l'argent arrive sur ton compte. Voir notre guide [Stripe pour débutant](/blog/stripe-abonnements-debutant).

## Étape 7 : mettre en ligne et trouver tes premiers clients

Un SaaS que personne ne voit ne rapporte rien. Dès que ta première version marche, montre-la : vidéos TikTok, messages directs aux personnes qui ont le problème, groupes spécialisés. Les [10 premiers clients](/blog/trouver-ses-premiers-clients-saas) se trouvent presque toujours à la main.

## Combien de temps ça prend

Pour une première version simple, compte quelques jours à quelques semaines selon ton temps disponible. Le plus long n'est généralement pas la construction, mais **trouver la bonne idée** et **trouver les clients**.

> Le vrai secret n'est pas technique : c'est de lancer une version simple vite, puis de l'améliorer avec les retours de vrais clients.`,
    faq: [
      {
        q: "Peut-on vraiment créer un SaaS sans coder ?",
        a: "Oui, pour une première version : les outils d'IA écrivent le code à partir de tes instructions. Il faut tester et corriger, mais aucune connaissance en programmation n'est nécessaire pour démarrer.",
      },
      {
        q: "Quel outil choisir pour débuter ?",
        a: "Lovable ou Bolt pour démarrer vite et visuellement, Replit pour un tout-en-un, Claude Code si tu veux plus de contrôle sur le projet.",
      },
      {
        q: "Combien coûte la création d'un SaaS avec l'IA ?",
        a: "Les outils proposent souvent une version gratuite ou un abonnement de quelques dizaines d'euros par mois. Ajoute un nom de domaine (environ 10 à 15 € par an) et les frais Stripe prélevés sur chaque paiement.",
      },
    ],
  },
  {
    slug: "idees-de-saas-a-lancer-seul",
    title: "40 idées de SaaS simples à lancer seul (et comment choisir la tienne)",
    description:
      "40 idées de SaaS concrètes, classées par type de client, que tu peux construire seul avec l'IA. Plus la méthode pour choisir celle qui te correspond.",
    category: "idees",
    date: "2026-11-22",
    body: `Une bonne idée de SaaS n'a pas besoin d'être révolutionnaire. Elle doit régler **un problème précis** pour **un type de client précis**, qui paie déjà pour le régler autrement (en temps, en argent ou en stress). Voici 40 idées pour t'inspirer, classées par cible.

## Pour les artisans et commerces

- Un rappel SMS automatique de rendez-vous pour coiffeurs et esthéticiennes.
- Un outil qui demande un avis Google après chaque visite.
- Un menu de restaurant en QR code, modifiable en un clic.
- Un générateur de devis pour plombiers et électriciens.
- Une carte de fidélité numérique pour boulangeries et cafés.
- Un planning d'équipe simple pour petits commerces.
- Un outil de réservation de créneaux pour garages.
- Un suivi des stocks ultra simple pour petites boutiques.

## Pour les freelances

- La relance automatique des factures impayées.
- Un portail client pour partager fichiers et validations.
- Un calculateur de tarif journalier selon les charges.
- Un suivi du temps passé par client, avec export.
- Un générateur de propositions commerciales.
- Un tableau de bord de chiffre d'affaires pour micro-entrepreneurs.
- Un outil de prise de rendez-vous avec acompte.

## Pour les créateurs de contenu

- Un planificateur d'idées de vidéos avec rappels quotidiens.
- Un générateur de scripts courts pour TikTok et Reels.
- Une page de liens personnalisée avec statistiques.
- Un outil de suivi des partenariats et des paiements de marques.
- Un générateur de sous-titres stylisés.

## Pour les coachs et formateurs

- La gestion des programmes et du suivi de chaque client.
- Un espace membre pour vendre une formation.
- Un questionnaire de bilan automatisé avant le premier appel.
- Un rappel automatique des séances avec paiement intégré.
- Un journal de progression partagé entre coach et client.

## Pour l'immobilier

- Un rédacteur d'annonces immobilières à partir de photos.
- Un suivi des visites et des retours acheteurs.
- Un outil de gestion des quittances pour petits propriétaires.
- Un calculateur de rentabilité locative.
- Un état des lieux numérique avec photos.

## Pour les associations et clubs

- La gestion des cotisations avec relances.
- Un planning des bénévoles.
- Les inscriptions aux événements avec paiement.
- Un annuaire des membres sécurisé.

## Pour les particuliers

- Un planificateur de repas avec liste de courses.
- Un suivi des abonnements pour arrêter de payer ce qu'on n'utilise plus.
- Un coach de révision pour étudiants.
- Un suivi des dépenses partagées en colocation.
- Un carnet d'entretien numérique pour sa voiture.
- Un programme sportif personnalisé avec suivi.

## Comment choisir parmi ces idées

Une idée vaut surtout par **ton accès aux clients**. Si ta tante est coiffeuse et que tu connais trois salons, l'outil de rappel SMS est un excellent choix : tu peux parler à tes futurs clients dès demain.

Pose-toi ces questions :

1. **Est-ce que je connais des gens qui ont ce problème ?**
2. **Est-ce qu'ils paient déjà quelque chose pour le régler ?**
3. **Est-ce que je peux expliquer l'outil en une phrase ?**
4. **Est-ce qu'un prix entre 9 et 49 € par mois leur paraît raisonnable ?**

Si tu réponds oui aux quatre, tu tiens une piste sérieuse. Ensuite, [valide-la avant de la construire](/blog/valider-une-idee-de-saas).

> Évite les idées « pour tout le monde ». Un outil pour « toutes les entreprises » est un outil pour personne. Un outil pour « les coiffeurs indépendants qui perdent des rendez-vous » se vend.

Tu hésites encore ? Notre questionnaire part de ton temps, de ton niveau et de ce que tu aimes pour te proposer une idée adaptée.`,
    faq: [
      {
        q: "Quelle est l'idée de SaaS la plus simple à lancer ?",
        a: "Celle qui règle un seul problème pour un type de client que tu connais déjà. Par exemple, un rappel de rendez-vous pour les coiffeurs si tu en connais plusieurs.",
      },
      {
        q: "Faut-il une idée unique ?",
        a: "Non. La concurrence prouve qu'il y a un marché. Tu peux gagner en visant une niche plus précise, en étant plus simple ou en parlant mieux à ta cible.",
      },
    ],
  },
  {
    slug: "trouver-une-idee-de-saas",
    title: "Comment trouver une idée de SaaS qui se vend vraiment",
    description:
      "La méthode pour trouver une idée de SaaS rentable : partir des problèmes, écouter les clients, repérer ce qu'ils paient déjà. Sans brainstorming à l'aveugle.",
    category: "idees",
    date: "2026-11-22",
    body: `La plupart des gens cherchent une idée de SaaS en se demandant « qu'est-ce que je pourrais créer ? ». C'est la mauvaise question. La bonne, c'est : **« quel problème des gens paient-ils déjà pour régler ? »**

## Pars des problèmes, pas des solutions

Un problème qui se vend a trois caractéristiques :

- il revient **souvent** (chaque jour, chaque semaine) ;
- il coûte **du temps ou de l'argent** ;
- la personne qui l'a est **capable de payer** pour le régler.

« Les freelances oublient de relancer leurs factures et attendent leur argent des semaines » coche les trois cases. « Les gens aimeraient mieux organiser leurs photos de vacances » en coche une.

## 5 sources pour trouver des problèmes réels

### 1. Ton entourage et ton expérience
Ton job étudiant, le métier de tes parents, ton club de sport : chaque milieu a ses tâches pénibles. Demande simplement : « Qu'est-ce qui te prend le plus de temps et que tu détestes faire ? »

### 2. Les avis négatifs des logiciels existants
Sur les sites d'avis et les stores d'applications, les avis à une ou deux étoiles sont une mine d'or. Ils disent exactement ce qui manque : « trop compliqué », « trop cher pour une petite structure », « pas en français ».

### 3. Les groupes et forums spécialisés
Groupes Facebook de coiffeurs, forums d'auto-entrepreneurs, subreddits de métiers : cherche les messages qui commencent par « Vous utilisez quoi pour… » ou « Comment vous faites pour… ».

### 4. Les tableurs Excel
Partout où quelqu'un gère quelque chose dans un tableur partagé, il y a un SaaS potentiel. Le tableur est la preuve que le besoin existe et qu'aucun outil simple ne le règle encore.

### 5. Les tâches répétitives
Copier des données d'un outil à un autre, envoyer le même e-mail chaque semaine, refaire le même document : tout ce qui est répétitif peut être automatisé.

## Le test des trois questions

Pour chaque idée, réponds :

1. **Qui exactement** a ce problème ? (pas « les entreprises », mais « les coiffeurs indépendants »)
2. **Comment le règle-t-il aujourd'hui ?** (s'il ne fait rien, le problème n'est peut-être pas assez douloureux)
3. **Où se trouvent ces personnes ?** (si tu ne sais pas où les trouver, tu auras du mal à vendre)

## Ton avantage injuste

Choisis une idée où tu as un avantage : tu connais le métier, tu as accès aux clients, ou tu parles leur langage. Cet avantage compte plus que l'originalité de l'idée. Si tu manques d'inspiration, pioche dans nos [40 idées de SaaS simples](/blog/idees-de-saas-a-lancer-seul).

## Ensuite : valide avant de construire

Une idée qui te plaît n'est pas encore une idée qui se vend. Avant d'écrire la moindre ligne de prompt, parle à 5 à 10 personnes qui ont le problème. Notre guide pour [valider une idée de SaaS](/blog/valider-une-idee-de-saas) te donne les questions à poser.

> Une bonne idée tient en une phrase : « J'aide [qui] à [résultat] sans [douleur actuelle] ».`,
    faq: [
      {
        q: "Où trouver des idées de SaaS ?",
        a: "Dans ton entourage, les avis négatifs des logiciels existants, les groupes spécialisés, les tableurs que les gens utilisent et les tâches répétitives de chaque métier.",
      },
      {
        q: "Comment savoir si une idée de SaaS est bonne ?",
        a: "Le problème doit revenir souvent, coûter du temps ou de l'argent, et toucher des personnes capables de payer. Ensuite, valide en parlant à de vrais clients potentiels.",
      },
    ],
  },
  {
    slug: "quel-prix-pour-un-saas",
    title: "Quel prix pour ton SaaS ? Fixer ton abonnement sans te tromper",
    description:
      "Comment fixer le prix de ton abonnement SaaS : par rapport à la valeur, aux concurrents et à ta cible. Exemples de grilles de prix et erreurs à éviter.",
    category: "argent",
    date: "2026-11-22",
    body: `Le prix est la décision qui a le plus d'impact sur tes revenus, et c'est souvent celle qu'on prend le plus vite. Bonne nouvelle : un prix se change. Mais autant partir sur une bonne base.

## Le prix dépend de la valeur, pas de ton coût

Ton SaaS te coûte peut-être 20 € par mois à faire tourner. Ce n'est pas une raison pour le vendre 5 €. La bonne question est : **combien ton outil fait-il gagner ou économiser à ton client ?**

Si ton outil fait récupérer à un freelance 500 € de factures impayées par mois, 29 € par mois est une évidence pour lui. Si ton outil lui fait gagner deux heures par semaine, et qu'il facture 40 € de l'heure, il gagne plus de 300 € de temps par mois.

## Les fourchettes courantes

- **Particuliers (B2C)** : souvent entre 5 et 15 € par mois. Les particuliers comparent avec Netflix ou Spotify.
- **Indépendants et petits commerces** : souvent entre 15 et 50 € par mois.
- **Entreprises** : à partir de 50 € par mois, souvent bien plus, mais le cycle de vente est plus long.

Pour un premier SaaS seul, viser des **indépendants ou petits pros entre 19 et 49 €** est souvent le meilleur compromis : ils décident vite et paient sans réunion.

## Regarde ce que paient déjà tes clients

Liste les outils ou solutions que ta cible utilise aujourd'hui, et leurs prix. Tu as trois options :

- **Moins cher et plus simple** : pour ceux qui trouvent les outils existants trop lourds.
- **Même prix mais spécialisé** : pour une niche précise que les gros outils servent mal.
- **Plus cher avec un service en plus** : configuration faite pour eux, support réactif.

## Mensuel, annuel, à vie ?

- **Mensuel** : le plus simple à vendre, ton revenu récurrent de base.
- **Annuel** : propose 2 mois offerts (par exemple 290 € par an au lieu de 348 €). Tu encaisses d'avance et tes clients restent plus longtemps.
- **Accès à vie** : rapporte de la trésorerie rapidement, mais ne crée pas de revenu récurrent. À utiliser avec prudence.

## Deux ou trois formules, pas plus

Une grille simple aide le client à choisir :

1. **Essentiel** : la fonction principale.
2. **Pro** (mise en avant) : tout, plus les options utiles aux clients actifs.
3. Optionnel : **Équipe**, pour plusieurs utilisateurs.

## Les erreurs classiques

- **Trop bas par peur** : un prix trop bas attire des clients exigeants et ne finance rien. Si personne ne trouve ton prix trop cher, il est probablement trop bas.
- **Trop de formules** : le client hésite et part.
- **Ne jamais tester** : augmente ton prix pour les nouveaux clients et observe. Tu ne perds rien à essayer.

## Combien de clients il te faut

Une fois ton prix fixé, divise ton objectif mensuel par ce prix. Pour 2 000 € par mois à 29 €, il te faut environ 69 clients. Fais le calcul pour ton objectif avec notre article [combien de clients pour 1 000 € par mois](/blog/combien-de-clients-pour-1000-euros-par-mois).`,
    faq: [
      {
        q: "Quel est le prix moyen d'un abonnement SaaS ?",
        a: "Il n'y a pas de moyenne utile : un SaaS pour particuliers coûte souvent 5 à 15 € par mois, un outil pour indépendants 15 à 50 €, un logiciel d'entreprise bien plus.",
      },
      {
        q: "Faut-il proposer une offre gratuite ?",
        a: "Pas forcément au début. Un essai gratuit limité dans le temps (7 ou 14 jours) est souvent plus efficace qu'une version gratuite permanente pour un premier SaaS.",
      },
    ],
  },
];
