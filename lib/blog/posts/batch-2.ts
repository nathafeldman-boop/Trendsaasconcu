import type { BlogPost } from "@/lib/blog/types";

export const POSTS_2: BlogPost[] = [
  {
    slug: "vibe-coding",
    title: "Vibe coding : créer une application en parlant à l'IA",
    description:
      "Le vibe coding, c'est construire un logiciel en décrivant ce que tu veux à une IA. Comment ça marche, ses limites, et comment l'utiliser pour lancer ton SaaS.",
    category: "creer",
    date: "2026-11-22",
    body: `« Vibe coding » : le mot circule partout depuis que les IA savent écrire du code. L'idée est simple : au lieu d'écrire le code toi-même, tu **décris** ce que tu veux, l'IA l'écrit, tu testes, et tu ajustes en conversant.

## Comment ça marche concrètement

1. Tu ouvres un outil comme Lovable, Bolt, Replit ou Claude Code.
2. Tu décris ton application : « Un outil pour que les coiffeurs envoient un SMS de rappel la veille de chaque rendez-vous. »
3. L'IA génère les pages, la base de données, les boutons.
4. Tu testes. Quelque chose ne va pas ? Tu le dis avec tes mots : « Quand je clique sur Ajouter, rien ne se passe. »
5. L'IA corrige. Et ainsi de suite.

Tu restes le **chef de projet** : tu décides de ce qui doit exister, l'IA s'occupe du comment.

## Ce que le vibe coding fait très bien

- **Les premières versions** : un MVP fonctionnel en quelques heures ou quelques jours.
- **Les interfaces** : pages, formulaires, tableaux de bord.
- **Les fonctions classiques** : inscription, connexion, paiement, envoi d'e-mails.
- **Les corrections ciblées**, quand tu décris précisément le problème.

## Ses limites (à connaître avant de te lancer)

- **L'IA ne devine pas** : si ta description est floue, le résultat le sera aussi.
- **Les projets grossissent vite** : plus il y a de fonctions, plus il faut être méthodique pour ne pas tout casser à chaque modification.
- **La sécurité demande de l'attention** : vérifie que chaque utilisateur ne voit que ses propres données. Demande-le explicitement à l'IA.
- **Tester reste ton job** : l'IA dit souvent « c'est corrigé » alors qu'il faut vérifier.

## Les bonnes pratiques

### Une demande à la fois
« Ajoute un bouton pour exporter en PDF » marche mieux que cinq changements dans le même message.

### Décris le résultat attendu
Au lieu de « améliore la page », écris « sur mobile, le bouton doit être en bas de l'écran et prendre toute la largeur ».

### Garde une trace
Note ce que tu as demandé et ce qui marche. Si une modification casse tout, tu sauras revenir en arrière.

### Commence par un prompt complet
Un bon prompt de départ décrit les utilisateurs, les pages et les actions. On t'explique comment l'écrire dans [le prompt qui construit ton application](/blog/ecrire-un-prompt-pour-creer-une-application).

## Vibe coding et SaaS : le bon combo

Le vibe coding rend la construction accessible, mais ne remplace pas le reste : une **bonne idée**, un **bon prix** et des **clients**. Ceux qui réussissent passent moins de temps à peaufiner leur code et plus de temps à parler à leurs utilisateurs. Si tu débutes, lis aussi [créer un SaaS sans savoir coder](/blog/creer-un-saas-sans-coder).

> Le vibe coding te fait gagner des mois sur la construction. Utilise ce temps pour vendre.`,
    faq: [
      {
        q: "Qu'est-ce que le vibe coding ?",
        a: "C'est le fait de créer un logiciel en décrivant ce que tu veux à une IA, qui écrit le code. Tu testes et tu ajustes en conversant avec elle.",
      },
      {
        q: "Le vibe coding est-il fiable pour un vrai produit ?",
        a: "Pour une première version, oui, à condition de tester sérieusement et de vérifier la sécurité des données. Pour un produit qui grandit, il faut être de plus en plus méthodique.",
      },
    ],
  },
  {
    slug: "lovable-bolt-replit-comparatif",
    title: "Lovable, Bolt, Replit, Claude Code : quel outil IA choisir pour créer ton SaaS ?",
    description:
      "Comparatif des outils IA pour créer une application sans coder : Lovable, Bolt, Replit et Claude Code. Points forts, limites et lequel choisir selon ton profil.",
    category: "creer",
    date: "2026-11-22",
    body: `Tous ces outils promettent la même chose : transformer ta description en application. Dans les faits, ils ne s'utilisent pas de la même façon. Voici comment choisir. (Les fonctions et les prix évoluent vite : vérifie toujours sur leur site.)

## Lovable

**Pour qui** : les débutants qui veulent un résultat visuel rapidement.

- Tu décris ton application dans une conversation, tu vois le résultat en direct.
- Très bon pour les interfaces propres et modernes.
- S'intègre avec Supabase pour la base de données et les comptes utilisateurs.

**Limite** : quand le projet devient complexe, il faut être très précis dans tes demandes.

## Bolt

**Pour qui** : ceux qui veulent tester une idée en quelques minutes.

- Fonctionne directement dans le navigateur.
- Génère rapidement une application complète à partir d'un prompt.
- Pratique pour prototyper et montrer une idée.

**Limite** : comme Lovable, demande de la méthode pour les gros projets.

## Replit

**Pour qui** : ceux qui veulent un tout-en-un, du code à l'hébergement.

- L'agent IA construit l'application et la met en ligne au même endroit.
- Base de données, hébergement et nom de domaine peuvent être gérés dans l'outil.
- Bon compromis entre simplicité et contrôle.

**Limite** : l'interface est plus technique au premier abord.

## Claude Code

**Pour qui** : ceux qui veulent le plus de contrôle et sont prêts à apprendre un peu.

- L'IA travaille directement sur les fichiers de ton projet.
- Très efficace sur les projets qui grossissent : elle lit le code existant avant de le modifier.
- Tu peux héberger où tu veux (Vercel, par exemple).

**Limite** : demande d'installer quelques outils et d'être à l'aise avec un terminal, même si l'IA t'explique chaque étape.

## Lequel choisir ?

- **Tu n'as jamais rien construit** : commence par Lovable ou Bolt pour voir ton idée prendre forme.
- **Tu veux tout au même endroit** : Replit.
- **Tu veux un projet solide qui peut grandir** : Claude Code.

Le meilleur outil est celui que tu utilises vraiment. Changer d'outil en cours de route est possible, mais coûte du temps.

## Ce qui compte plus que l'outil

Quel que soit l'outil, la qualité du résultat dépend surtout de **ton prompt** et de **ta façon de tester**. Un prompt précis sur un outil simple bat un prompt flou sur l'outil le plus puissant. Lis notre guide pour [écrire le prompt qui construit ton application](/blog/ecrire-un-prompt-pour-creer-une-application), puis notre introduction au [vibe coding](/blog/vibe-coding).`,
    faq: [
      {
        q: "Quel est le meilleur outil IA pour créer une application sans coder ?",
        a: "Pour débuter, Lovable ou Bolt sont les plus simples. Replit est un bon tout-en-un. Claude Code offre le plus de contrôle pour un projet qui doit grandir.",
      },
      {
        q: "Peut-on changer d'outil après avoir commencé ?",
        a: "Oui, en récupérant le code du projet, mais cela demande un peu de travail. Mieux vaut choisir selon ton objectif dès le départ.",
      },
    ],
  },
  {
    slug: "trouver-ses-premiers-clients-saas",
    title: "Trouver tes 10 premiers clients SaaS : la méthode qui marche à la main",
    description:
      "Tes 10 premiers clients ne viendront pas tout seuls. Où les trouver, quoi leur dire et comment les convaincre de payer, sans budget publicitaire.",
    category: "vendre",
    date: "2026-11-22",
    body: `Ton SaaS est en ligne. Personne ne s'inscrit. C'est normal : au début, **personne ne sait que tu existes**. Les 10 premiers clients se gagnent presque toujours à la main, un par un. Voici comment.

## Commence par ceux que tu connais

Fais la liste de toutes les personnes de ton entourage qui ont le problème que ton SaaS règle, ou qui connaissent quelqu'un qui l'a. Famille, anciens collègues, amis, voisins commerçants. Écris-leur personnellement :

> « Salut, j'ai créé un petit outil qui [résultat]. Tu connais quelqu'un qui perd du temps avec [problème] ? J'aimerais le lui montrer gratuitement. »

## Va là où sont tes clients

- **Groupes Facebook et forums** de ton métier cible : aide d'abord, présente ton outil quand c'est pertinent.
- **LinkedIn** : pour les clients professionnels, un message court et personnalisé.
- **En personne** : pour les commerces locaux, rien ne bat une visite avec ton téléphone en main pour faire la démo.

## Montre, ne raconte pas

Une démo de 30 secondes vaut mieux qu'un long message. Filme ton écran : le problème, puis ton outil qui le règle. C'est aussi parfait pour [TikTok](/blog/vendre-un-saas-avec-tiktok).

## Propose un démarrage sans risque

Pour tes premiers clients, réduis le risque au maximum :

- un essai gratuit de 7 ou 14 jours ;
- la configuration faite **avec eux** en visio ;
- un prix de lancement pour les 10 premiers, en échange de leurs retours.

Évite de tout donner gratuitement pour toujours : un client qui paie, même peu, te dit la vérité sur la valeur de ton outil.

## Le suivi fait la vente

La plupart des ventes se font à la deuxième ou troisième relance, pas au premier message. Note qui tu as contacté, quand, et relance poliment quelques jours plus tard.

## Écoute chaque client

Tes 10 premiers clients sont tes meilleurs conseillers. Demande-leur :

1. Qu'est-ce qui t'a convaincu ?
2. Qu'est-ce qui a failli te faire renoncer ?
3. Qu'est-ce qui manque ?

Leurs réponses te donnent tes futurs textes de vente et tes prochaines fonctions.

## Ce qu'il ne faut pas faire au début

- **Payer de la publicité** avant d'avoir des clients satisfaits : tu paierais pour apprendre ce qu'une conversation t'aurait appris gratuitement.
- **Attendre que le produit soit parfait** : il ne le sera jamais.
- **Envoyer le même message générique à 500 personnes** : peu de réponses, et tu passes pour un spammeur.

> 10 conversations par jour pendant deux semaines valent plus que trois mois de développement en silence.`,
    faq: [
      {
        q: "Comment trouver ses premiers clients sans budget ?",
        a: "En contactant directement les personnes qui ont le problème : entourage, groupes spécialisés, LinkedIn, visites en personne, et des vidéos de démo courtes sur les réseaux.",
      },
      {
        q: "Faut-il offrir son SaaS gratuitement aux premiers clients ?",
        a: "Un essai gratuit limité ou un prix de lancement, oui. Gratuit pour toujours, non : un client qui paie te donne des retours bien plus fiables.",
      },
    ],
  },
  {
    slug: "statut-micro-entreprise-saas",
    title: "Quel statut pour vendre un SaaS en France ? La micro-entreprise expliquée",
    description:
      "Micro-entreprise, SASU, EURL : quel statut choisir pour vendre ton SaaS en France. Démarches, cotisations, TVA et seuils, expliqués simplement.",
    category: "lancer",
    date: "2026-11-22",
    body: `Pour encaisser légalement les abonnements de ton SaaS en France, il te faut un statut. Pour démarrer seul, la **micro-entreprise** (anciennement auto-entrepreneur) est presque toujours le meilleur choix. Voici pourquoi, et ce qu'il faut savoir.

> Cet article donne des repères généraux. Les seuils et les taux changent régulièrement : vérifie toujours sur autoentrepreneur.urssaf.fr ou auprès d'un expert-comptable.

## Pourquoi la micro-entreprise pour démarrer

- **Création gratuite et rapide**, en ligne, sur le guichet unique de l'INPI.
- **Cotisations proportionnelles** à ton chiffre d'affaires : pas de chiffre, pas de cotisations.
- **Comptabilité simplifiée** : un livre des recettes suffit dans la plupart des cas.
- **Pas de capital** à déposer.

## Comment ton SaaS est classé

La vente d'abonnements à un logiciel est généralement considérée comme une **prestation de services**. Selon la façon dont ton activité est déclarée, les cotisations se situent en général **autour de 21 à 26 % de ton chiffre d'affaires**. Vérifie le taux exact qui correspond à ton code d'activité au moment de ta déclaration.

## Les seuils à connaître

- **Plafond de chiffre d'affaires** : la micro-entreprise est limitée en chiffre d'affaires annuel pour les prestations de services. Au-delà, tu passes à un autre régime.
- **Franchise de TVA** : sous un certain seuil de chiffre d'affaires, tu ne factures pas de TVA (mention « TVA non applicable, art. 293 B du CGI » sur tes factures). Au-delà, tu dois la facturer et la reverser.

Les montants de ces seuils sont revus par la loi : vérifie les valeurs en vigueur avant de te lancer.

## Les démarches, étape par étape

1. Déclare ton activité sur le guichet unique (formalites.entreprises.gouv.fr).
2. Reçois ton numéro **SIRET**.
3. Ouvre un **compte bancaire dédié** (obligatoire au-delà d'un certain chiffre d'affaires, recommandé dès le départ).
4. Crée ton compte **Stripe** avec ton SIRET pour encaisser les abonnements. Voir [Stripe pour débutant](/blog/stripe-abonnements-debutant).
5. Déclare ton chiffre d'affaires chaque mois ou chaque trimestre sur le site de l'Urssaf.

## Et si je suis mineur ?

En France, un mineur peut, sous conditions, devenir micro-entrepreneur à partir de 16 ans (avec l'autorisation de ses représentants légaux, ou s'il est émancipé). Les plateformes de paiement demandent souvent d'avoir 18 ans. Nous détaillons ce cas dans un article dédié au lancement d'un SaaS jeune.

## Quand passer en société (SASU, EURL)

Une société devient intéressante quand ton chiffre d'affaires approche les plafonds, quand tu as beaucoup de frais à déduire, ou quand tu t'associes. Au démarrage, la micro-entreprise suffit largement : l'important est de **trouver tes premiers clients**, pas d'optimiser une fiscalité que tu n'as pas encore.

## N'oublie pas les obligations du site

Vendre en ligne impose aussi des mentions légales, des conditions générales de vente et le respect du RGPD.`,
    faq: [
      {
        q: "Peut-on vendre un SaaS en micro-entreprise ?",
        a: "Oui. La vente d'abonnements à un logiciel est en général une prestation de services, compatible avec la micro-entreprise dans la limite des plafonds de chiffre d'affaires.",
      },
      {
        q: "Faut-il facturer la TVA sur un abonnement SaaS ?",
        a: "Pas tant que tu bénéficies de la franchise en base de TVA (sous un seuil de chiffre d'affaires). Au-delà, tu dois facturer la TVA. Vérifie le seuil en vigueur.",
      },
    ],
  },
  {
    slug: "combien-de-clients-pour-1000-euros-par-mois",
    title: "Combien de clients pour gagner 1 000 € par mois avec un SaaS ?",
    description:
      "Le calcul simple pour savoir combien de clients il te faut pour 1 000, 3 000 ou 5 000 € par mois avec un SaaS, selon ton prix d'abonnement. Avec frais et cotisations.",
    category: "argent",
    date: "2026-11-22",
    body: `C'est la question que tout le monde se pose avant de se lancer. La réponse tient en une division : **objectif mensuel ÷ prix de l'abonnement**. Mais il faut aussi compter ce qui part en frais.

## Le calcul de base

Pour 1 000 € de revenu mensuel récurrent :

- à **9 €** par mois : 112 clients ;
- à **19 €** par mois : 53 clients ;
- à **29 €** par mois : 35 clients ;
- à **49 €** par mois : 21 clients ;
- à **99 €** par mois : 11 clients.

On voit tout de suite l'effet du prix : trouver 11 clients est bien plus simple que d'en trouver 112. C'est pour ça qu'on conseille souvent de viser des **professionnels** à un prix entre 19 et 49 €. Voir [quel prix pour ton SaaS](/blog/quel-prix-pour-un-saas).

## Et pour 3 000 ou 5 000 € par mois

À 29 € par mois :

- **3 000 €** : 104 clients ;
- **5 000 €** : 173 clients.

À 49 € par mois :

- **3 000 €** : 62 clients ;
- **5 000 €** : 103 clients.

## Ce qui part avant d'arriver dans ta poche

Le chiffre d'affaires n'est pas ce que tu gagnes. Il faut retirer :

- **Les frais de paiement** : pour Stripe, une petite commission par transaction (de l'ordre de 1,5 % + 0,25 € pour une carte européenne standard, à vérifier sur la grille tarifaire Stripe).
- **Les cotisations sociales** : en micro-entreprise, un pourcentage de ton chiffre d'affaires (voir notre article sur le [statut micro-entreprise](/blog/statut-micro-entreprise-saas)).
- **Tes outils** : hébergement, base de données, IA, nom de domaine. Souvent quelques dizaines d'euros par mois au début.

En ordre de grandeur, garde en tête qu'une part significative du chiffre d'affaires part en cotisations et frais.

## N'oublie pas les départs

Chaque mois, quelques clients arrêtent leur abonnement : c'est le **churn**. Si tu perds 5 % de tes clients par mois, il faut en gagner de nouveaux juste pour rester au même niveau. Garder tes clients compte autant qu'en trouver.

## Combien de temps pour y arriver

Ça dépend surtout de ta capacité à trouver des clients. Si tu gagnes 2 nouveaux clients par semaine à 29 €, tu atteins environ 1 000 € de revenu mensuel en 4 à 5 mois (en tenant compte de quelques départs). Si tu en gagnes 5 par semaine, en moins de deux mois.

## Fais ton propre calcul

1. Écris ton objectif mensuel.
2. Divise par ton prix.
3. Ajoute environ 10 % de clients pour compenser les départs.
4. Divise par le nombre de semaines que tu te donnes : c'est ton objectif de nouveaux clients par semaine.

> Un objectif de « 35 clients » est concret. Un objectif de « faire de l'argent en ligne » ne l'est pas.`,
    faq: [
      {
        q: "Combien de clients pour 1 000 € par mois avec un SaaS ?",
        a: "À 29 € par mois, environ 35 clients. À 49 €, environ 21 clients. Divise simplement ton objectif par ton prix d'abonnement, puis compte les frais et les départs.",
      },
      {
        q: "Un SaaS à 1 000 € par mois, c'est réaliste ?",
        a: "Oui, beaucoup de petits SaaS y arrivent. Le plus difficile n'est pas la construction mais la recherche régulière de nouveaux clients.",
      },
    ],
  },
];
