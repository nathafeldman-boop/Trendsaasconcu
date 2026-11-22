import type { BlogPost } from "@/lib/blog/types";

export const POSTS_4: BlogPost[] = [
  {
    slug: "mrr-c-est-quoi",
    title: "MRR : c'est quoi et comment le calculer pour ton SaaS",
    description:
      "Le MRR (revenu mensuel récurrent) est l'indicateur numéro un d'un SaaS. Définition, calcul avec exemples, et comment le faire grandir mois après mois.",
    category: "argent",
    date: "2026-12-04",
    body: `Si tu ne devais suivre qu'un chiffre pour ton SaaS, ce serait celui-là. Le **MRR**, pour Monthly Recurring Revenue, c'est le **revenu mensuel récurrent** : ce que tes abonnements te rapportent chaque mois, de façon régulière.

## Le calcul

**MRR = somme des abonnements mensuels actifs.**

- 20 clients à 29 € par mois : MRR de 580 €.
- 10 clients à 29 € et 5 clients à 49 € : MRR de 290 + 245 = 535 €.

Pour un abonnement **annuel**, divise par 12 : un client qui paie 290 € par an compte pour environ 24 € de MRR.

## Ce qui ne compte pas dans le MRR

- Les paiements uniques (frais d'installation, accès à vie).
- Les essais gratuits qui n'ont pas encore payé.
- Les remboursements.

Le MRR mesure ce qui **revient**, pas ce qui est entré une fois.

## Les quatre mouvements du MRR

Chaque mois, ton MRR bouge pour quatre raisons :

1. **Nouveau MRR** : les nouveaux clients.
2. **MRR d'expansion** : des clients qui passent à une formule plus chère.
3. **MRR de contraction** : des clients qui passent à une formule moins chère.
4. **MRR perdu (churn)** : des clients qui arrêtent.

**MRR du mois = MRR précédent + nouveau + expansion − contraction − perdu.**

## Pourquoi c'est si important

- Il te dit si ton SaaS **grandit vraiment**, au-delà d'un bon mois ponctuel.
- Il te permet de **prévoir** : avec un MRR de 2 000 € et peu de départs, tu sais à peu près ce que tu gagneras le mois prochain.
- Multiplié par 12, il donne ton **ARR** (revenu annuel récurrent), souvent utilisé pour estimer la valeur d'un SaaS.

## Comment faire grandir ton MRR

- **Trouver des clients régulièrement** plutôt que par à-coups. Voir [trouver tes 10 premiers clients](/blog/trouver-ses-premiers-clients-saas).
- **Réduire les départs** : un client gardé vaut souvent mieux qu'un nouveau client.
- **Proposer une formule supérieure** à ceux qui utilisent beaucoup l'outil.
- **Augmenter ton prix** pour les nouveaux clients quand ton produit s'améliore. Voir [quel prix pour ton SaaS](/blog/quel-prix-pour-un-saas).

## Où suivre ton MRR

Le tableau de bord Stripe affiche ton revenu récurrent. Tu peux aussi le suivre dans un tableur. L'important est de le regarder **chaque semaine**, avec le nombre de nouveaux clients et de départs.`,
    faq: [
      {
        q: "Comment calculer le MRR ?",
        a: "Additionne le montant mensuel de tous les abonnements actifs. Pour un abonnement annuel, divise son prix par 12. Les paiements uniques ne comptent pas.",
      },
      {
        q: "Quelle différence entre MRR et chiffre d'affaires ?",
        a: "Le chiffre d'affaires compte tout ce qui est encaissé, y compris les paiements uniques. Le MRR ne compte que les revenus récurrents mensuels des abonnements actifs.",
      },
    ],
  },
  {
    slug: "churn-saas",
    title: "Churn : pourquoi tes clients partent et comment les garder",
    description:
      "Le churn, c'est le pourcentage de clients qui arrêtent leur abonnement. Comment le calculer, pourquoi il compte autant, et 8 façons concrètes de le réduire.",
    category: "argent",
    date: "2026-12-06",
    body: `Tu gagnes 10 clients ce mois-ci, mais tu en perds 6. Ton SaaS ne grandit presque pas. Ce phénomène a un nom : le **churn**, ou taux d'attrition. C'est l'ennemi silencieux des abonnements.

## Le calcul

**Churn mensuel = clients perdus pendant le mois ÷ clients au début du mois.**

Tu commences le mois avec 100 clients, 5 arrêtent : ton churn est de 5 %.

## Pourquoi c'est si important

Avec un churn de 5 % par mois, tu perds environ la moitié de tes clients en un an s'ils ne sont pas remplacés. Chaque point de churn en moins, c'est autant de clients que tu n'as pas besoin de retrouver.

Autrement dit : **garder un client coûte presque toujours moins cher que d'en trouver un nouveau**.

## Les raisons les plus fréquentes du départ

- Le client **n'a jamais vraiment commencé** à utiliser l'outil.
- Il **n'a pas obtenu le résultat** promis.
- L'outil est **trop compliqué** au quotidien.
- Il a trouvé **moins cher** ou mieux adapté.
- Son besoin a disparu (fin d'activité, changement de métier).
- Un **paiement a échoué** et personne ne l'a relancé.

## 8 façons de réduire ton churn

### 1. Soigner les premiers jours
La majorité des départs se décident au début. Aide chaque nouveau client à obtenir un premier résultat rapidement : configuration guidée, e-mail de bienvenue, appel de démarrage.

### 2. Demander pourquoi
Quand un client résilie, pose une question simple : « Qu'est-ce qui t'a manqué ? » Les réponses valent de l'or.

### 3. Relancer les paiements échoués
Une partie du churn est involontaire : carte expirée, plafond atteint. Active les relances automatiques de ton outil de paiement. Voir [Stripe pour débutant](/blog/stripe-abonnements-debutant).

### 4. Proposer une pause
Certains clients partent pour une raison temporaire. Une pause de un ou deux mois en garde une partie.

### 5. Proposer l'annuel
Les clients engagés à l'année partent moins souvent. Une réduction de deux mois offerts est un classique.

### 6. Rester en contact
Un e-mail mensuel avec les nouveautés ou un conseil utile rappelle que ton outil existe et s'améliore.

### 7. Surveiller ceux qui n'utilisent plus l'outil
Un client qui ne se connecte plus partira bientôt. Contacte-le avant qu'il résilie.

### 8. Améliorer ce qui bloque
Si plusieurs clients partent pour la même raison, c'est ta priorité de développement.

## Un bon churn, c'est combien ?

Ça dépend de ta cible : les particuliers partent plus souvent que les professionnels. Plutôt que de viser un chiffre théorique, suis **ta propre tendance** chaque mois et fais-la baisser. Pour suivre l'ensemble, regarde aussi ton [MRR](/blog/mrr-c-est-quoi).`,
    faq: [
      {
        q: "Qu'est-ce que le churn d'un SaaS ?",
        a: "C'est le pourcentage de clients qui arrêtent leur abonnement sur une période. Il se calcule en divisant les clients perdus par le nombre de clients au début de la période.",
      },
      {
        q: "Comment réduire le churn ?",
        a: "Aide les nouveaux clients à obtenir un résultat vite, relance les paiements échoués, demande pourquoi les clients partent, propose l'annuel et améliore ce qui bloque.",
      },
    ],
  },
  {
    slug: "vendre-un-saas-avec-tiktok",
    title: "Vendre ton SaaS avec TikTok : les formats de vidéos qui marchent",
    description:
      "TikTok peut t'amener tes premiers clients gratuitement. Les formats de vidéos qui marchent pour un SaaS, la fréquence, et comment transformer les vues en clients.",
    category: "vendre",
    date: "2026-12-08",
    body: `TikTok n'est pas réservé aux danses. C'est aujourd'hui l'un des moyens les plus rapides de montrer un produit à des milliers de personnes **sans payer de publicité**. Pour un SaaS, c'est une opportunité énorme, à condition de faire les bonnes vidéos.

## Pourquoi TikTok marche pour un SaaS

- L'algorithme montre tes vidéos à des inconnus, même si tu n'as aucun abonné.
- Une démo de logiciel en 20 secondes est un format naturel et concret.
- Tu peux tester beaucoup d'angles différents rapidement.

## Les formats qui marchent

### 1. Le problème puis la solution
Les 2 premières secondes montrent un problème que ta cible reconnaît (« Tu passes ton dimanche à relancer tes factures ? »), puis ton outil le règle en direct.

### 2. La démo écran
Filme ton écran (ou ton téléphone qui filme l'écran) pendant que tu utilises ton outil. Simple, crédible, efficace.

### 3. Les coulisses de la construction
« Jour 12 de la création de mon SaaS » : les gens adorent suivre une aventure. Montre tes progrès, tes erreurs, tes premiers clients.

### 4. Le tutoriel utile
Donne une astuce utile à ta cible, liée à ton outil. Un coiffeur qui apprend à réduire les rendez-vous oubliés, même sans ton outil, se souviendra de toi.

### 5. La réaction aux commentaires
Réponds en vidéo aux questions posées en commentaire. Ça crée de la proximité et ça te donne des idées de vidéos sans fin.

## Les règles pour des vidéos qui retiennent

- **Accroche en 1 à 2 secondes** : texte à l'écran et première phrase forte.
- **Court** : 15 à 40 secondes pour commencer.
- **Sous-titres** : beaucoup regardent sans le son.
- **Un seul message** par vidéo.
- **Un appel à l'action** clair : « lien dans la bio ».

## La fréquence

La régularité compte plus que la perfection. Plusieurs vidéos par jour au début te permettent de tester rapidement ce qui marche. Repère les vidéos qui performent, et fais-en des variantes.

## Transformer les vues en clients

- **Un lien en bio** qui mène directement à ta page d'inscription ou d'essai.
- **Une promesse cohérente** entre la vidéo et la page d'arrivée. Voir [la landing page d'un SaaS](/blog/landing-page-saas).
- **Réponds aux messages** : beaucoup de ventes commencent par une question en commentaire.

## Ce qu'il faut éviter

- Promettre des résultats que ton outil ne donne pas.
- Faire de la publicité déguisée : si un créateur parle de ton outil contre rémunération, il doit l'indiquer (mention « Collaboration commerciale » ou équivalent).
- Abandonner après dix vidéos : la plupart des comptes mettent du temps à trouver leur format.

Pour les autres canaux, lis aussi [trouver tes 10 premiers clients](/blog/trouver-ses-premiers-clients-saas).`,
    faq: [
      {
        q: "TikTok est-il efficace pour vendre un logiciel ?",
        a: "Oui, surtout au début : une démo courte montre concrètement le problème et la solution, et l'algorithme diffuse tes vidéos même sans abonnés.",
      },
      {
        q: "Combien de vidéos publier par jour ?",
        a: "Au début, plusieurs vidéos par jour permettent de tester des angles différents. La régularité compte plus que la qualité de production.",
      },
    ],
  },
  {
    slug: "landing-page-saas",
    title: "La landing page d'un SaaS : la structure qui transforme les visiteurs en clients",
    description:
      "Les sections indispensables d'une landing page de SaaS, dans le bon ordre : promesse, démonstration, preuve, prix, questions. Avec les erreurs à éviter.",
    category: "vendre",
    date: "2026-12-10",
    body: `Ta landing page, c'est ton vendeur qui travaille 24 h sur 24. Un visiteur arrive depuis une vidéo ou une recherche Google, et en quelques secondes il décide s'il reste. Voici la structure qui marche pour un SaaS.

## 1. Le titre : la promesse en une phrase

Le titre doit dire **ce que le client obtient**, pas ce que fait ton logiciel techniquement.

- Moyen : « Logiciel de gestion de rendez-vous avec notifications SMS ».
- Mieux : « Fini les rendez-vous oubliés : tes clients reçoivent un rappel la veille ».

Sous le titre, une phrase qui précise pour qui et comment.

## 2. Le bouton principal

Un seul bouton, visible tout de suite : « Essayer gratuitement », « Créer mon compte ». Répète-le plus bas dans la page.

## 3. La démonstration

Une capture d'écran, une courte vidéo ou une animation qui montre l'outil en action. Les visiteurs veulent **voir** avant de croire.

## 4. Le problème

Décris la situation de ton client avec ses mots : le temps perdu, l'argent perdu, la frustration. S'il se reconnaît, il continue de lire.

## 5. Comment ça marche, en 3 étapes

1. Tu crées ton compte.
2. Tu ajoutes tes rendez-vous.
3. Tes clients reçoivent leur rappel automatiquement.

Trois étapes rassurent : ça a l'air simple.

## 6. Les bénéfices

Trois ou quatre bénéfices concrets, pas une liste de 20 fonctions. Chaque bénéfice répond à « et alors, qu'est-ce que ça change pour moi ? ».

## 7. La preuve

Les avis de vrais clients, le nombre d'utilisateurs, des résultats obtenus. **N'invente jamais** d'avis ou de chiffres : c'est interdit, et tes visiteurs le sentent. Si tu débutes, montre plutôt une garantie, une démo honnête ou ton histoire.

## 8. Le prix

Affiche ton prix clairement, avec ce qui est inclus et le rythme de renouvellement. Cacher le prix fait fuir les visiteurs pressés. Voir [quel prix pour ton SaaS](/blog/quel-prix-pour-un-saas).

## 9. Les questions fréquentes

Réponds aux objections : « Est-ce que je peux résilier ? », « Mes données sont-elles en sécurité ? », « Faut-il installer quelque chose ? ».

## 10. Le rappel final

Un dernier bouton, avec la promesse reformulée.

## Les erreurs à éviter

- **Trop de texte en haut** : le visiteur doit comprendre en 5 secondes.
- **Plusieurs boutons qui mènent à des endroits différents** : un seul objectif par page.
- **Une page lente** : chaque seconde de chargement fait partir des visiteurs.
- **Oublier le mobile** : la majorité du trafic venant des réseaux sociaux arrive sur téléphone.

Une bonne landing page multiplie l'effet de tes [vidéos TikTok](/blog/vendre-un-saas-avec-tiktok) : elle transforme tes vues en inscriptions.`,
    faq: [
      {
        q: "Que mettre sur la landing page d'un SaaS ?",
        a: "Une promesse claire, un bouton d'action, une démonstration, le problème du client, le fonctionnement en 3 étapes, les bénéfices, des preuves réelles, le prix et une FAQ.",
      },
      {
        q: "Faut-il afficher le prix sur la landing page ?",
        a: "Oui, dans la plupart des cas. Un prix clair, avec ce qui est inclus et le renouvellement, rassure et évite de perdre les visiteurs pressés.",
      },
    ],
  },
  {
    slug: "revenus-passifs-saas",
    title: "Revenus passifs avec un SaaS : ce qui est vrai et ce qui ne l'est pas",
    description:
      "Un SaaS est-il vraiment un revenu passif ? Ce qui devient automatique, ce qui demande du travail, et comment réduire le temps passé une fois les clients trouvés.",
    category: "argent",
    date: "2026-12-12",
    body: `« Revenu passif » : l'expression fait rêver. Le SaaS est souvent présenté comme le revenu passif ultime. La vérité est plus nuancée : c'est un **revenu récurrent**, qui peut devenir **de moins en moins prenant**, mais qui ne tombe pas du ciel.

## Ce qui devient vraiment automatique

- **L'encaissement** : les abonnements se renouvellent seuls chaque mois.
- **La livraison** : ton logiciel fonctionne sans que tu interviennes à chaque utilisation.
- **Une partie du support** : une bonne FAQ et une interface claire évitent beaucoup de questions.
- **Une partie de l'acquisition** : un bon référencement ou des vidéos qui continuent de tourner amènent des clients sans effort quotidien.

## Ce qui demande du travail

- **Trouver des clients**, surtout au début. C'est le travail principal des premiers mois.
- **Répondre aux clients** : bugs, questions, demandes.
- **Maintenir l'outil** : mises à jour, sécurité, compatibilité.
- **Améliorer le produit** pour que les clients restent.

## Le vrai avantage du SaaS : le travail se cumule

Dans un job, si tu t'arrêtes, ton revenu s'arrête. En freelance aussi. Avec un SaaS, le travail fait il y a six mois **continue de rapporter** : chaque client gagné paie le mois suivant, et celui d'après.

C'est pour ça qu'on parle plutôt de **revenu récurrent** que passif. Voir [MRR : c'est quoi](/blog/mrr-c-est-quoi).

## Comment réduire ton temps passé

1. **Automatise l'accueil** des nouveaux clients : e-mails de bienvenue, guide de démarrage.
2. **Écris une FAQ** à partir des questions qui reviennent.
3. **Corrige les causes**, pas les symptômes : si dix clients posent la même question, l'interface doit changer.
4. **Investis dans des canaux durables** : articles de blog, vidéos de tutoriel, bouche-à-oreille.
5. **Garde ton produit simple** : chaque fonction ajoutée demande de la maintenance.

## Les promesses à fuir

Méfie-toi de quiconque promet un revenu passif garanti, rapide et sans effort. Un SaaS rentable demande un vrai problème, de vrais clients et du travail au début. La bonne nouvelle : ce travail est accessible, même sans savoir coder. Commence par [trouver une idée qui se vend](/blog/trouver-une-idee-de-saas).

> Un SaaS n'est pas un revenu passif. C'est un revenu qui récompense le travail passé, longtemps après l'avoir fait.`,
    faq: [
      {
        q: "Un SaaS est-il un revenu passif ?",
        a: "Pas complètement. Les paiements et la livraison sont automatiques, mais trouver des clients, faire le support et maintenir l'outil demandent du travail, surtout au début.",
      },
      {
        q: "Combien de temps par semaine demande un SaaS ?",
        a: "Beaucoup au lancement pour trouver les premiers clients, puis souvent moins une fois l'outil stable, l'accueil automatisé et les canaux d'acquisition installés.",
      },
    ],
  },
];
