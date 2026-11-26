// Searches made by our persona: 15-25, at school, in studies or just out,
// wants to earn money online, fast, without capital or a degree. One page
// per real question, written for them and leading to the questionnaire.

const AGES = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

const BY_AGE = (a: number) => [
  `gagner de l'argent à ${a} ans`,
  `gagner de l'argent en ligne à ${a} ans`,
  `idées de business à ${a} ans`,
  `créer son entreprise à ${a} ans`,
];

const SITUATIONS = [
  "en étant collégien", "en étant lycéen", "en étant étudiant", "en étant en alternance", "en étant en BTS",
  "en étant en fac", "en étant en prépa", "en étant au chômage", "en étant en service civique", "en étant en apprentissage",
  "sans diplôme", "sans argent de départ", "sans compétences", "sans montrer son visage", "sans parler",
  "depuis chez soi", "avec son téléphone", "avec un ordinateur", "sans ordinateur", "pendant les vacances d'été",
  "pendant les vacances scolaires", "le week-end", "le soir après les cours", "pendant ses études", "en habitant à la campagne",
  "sans permis", "sans réseau", "en étant timide", "en partant de zéro", "avec 0 abonné",
  "avec l'intelligence artificielle", "avec ChatGPT", "avec le montage vidéo", "avec le clipping", "avec les réseaux sociaux",
  "avec TikTok", "avec Instagram", "avec YouTube Shorts", "avec Snapchat", "avec Discord",
  "avec Roblox", "avec Fortnite", "avec les jeux vidéo", "avec Vinted", "avec Leboncoin",
  "avec un SaaS", "avec une application", "avec un site internet", "avec des templates", "avec des ebooks",
].map((s) => `gagner de l'argent ${s}`);

const AMOUNTS = [
  "gagner 10 euros rapidement", "gagner 20 euros rapidement", "gagner 50 euros rapidement", "gagner 100 euros rapidement",
  "gagner 100 euros par jour", "gagner 50 euros par jour", "gagner 100 euros par semaine", "gagner 200 euros par mois",
  "gagner 300 euros par mois", "gagner 500 euros par mois", "gagner 1000 euros par mois", "gagner 2000 euros par mois",
  "gagner 3000 euros par mois", "gagner 5000 euros par mois", "gagner 10 000 euros par mois", "gagner 1000 euros rapidement",
  "gagner de l'argent rapidement", "gagner de l'argent en 24 heures", "gagner de l'argent en une semaine",
  "gagner de l'argent tous les jours", "gagner de l'argent en dormant", "avoir un revenu passif à 18 ans",
  "avoir un revenu passif étudiant", "devenir indépendant financièrement jeune", "devenir riche jeune",
  "devenir millionnaire jeune", "économiser de l'argent quand on est jeune", "investir à 18 ans",
];

const QUESTIONS = [
  "quel business lancer à 18 ans", "quel business lancer sans argent", "quel business lancer en 2027",
  "quel business en ligne rapporte le plus", "quels sont les business en ligne rentables", "business en ligne pour débutant",
  "business en ligne sans investissement", "business en ligne étudiant", "business en ligne qui marche vraiment",
  "business en ligne légal", "business en ligne arnaque ou pas", "comment reconnaître une arnaque à l'argent facile",
  "faut-il acheter une formation pour gagner de l'argent", "les formations argent facile sont-elles des arnaques",
  "comment lancer son premier business", "comment trouver une idée de business", "comment trouver ses premiers clients",
  "comment vendre en ligne quand on est jeune", "comment créer un SaaS à 17 ans", "comment créer un SaaS sans savoir coder",
  "comment créer une application à 16 ans", "comment créer un site qui rapporte de l'argent", "comment faire sa première vente en ligne",
  "comment avoir des clients sans pub", "comment percer sur TikTok pour vendre", "comment monétiser un compte TikTok",
  "comment monétiser un compte Instagram", "comment faire du clipping", "comment devenir clipper", "le clipping est-il rentable",
  "comment devenir monteur vidéo freelance", "comment devenir community manager freelance", "comment devenir créateur UGC",
  "comment faire de l'affiliation sur TikTok", "comment vendre des produits numériques", "comment vendre des templates Notion",
  "comment vendre des presets", "comment faire du dropshipping à 16 ans", "le dropshipping est-il encore rentable",
  "comment faire de l'achat-revente", "comment revendre des sneakers", "comment revendre sur Vinted",
  "comment gagner de l'argent avec l'IA", "comment utiliser ChatGPT pour gagner de l'argent", "comment faire un business avec Claude",
  "comment coder avec l'IA quand on est débutant", "comment créer un bot Discord payant", "comment vendre un service en ligne",
  "comment fixer le prix de son service", "comment créer un abonnement en ligne", "comment recevoir des paiements en ligne",
  "comment encaisser des paiements quand on est mineur", "ouvrir un compte bancaire à 16 ans", "avoir une carte bancaire à 15 ans",
  "ouvrir un compte PayPal à 16 ans", "utiliser Stripe quand on est mineur", "créer une micro-entreprise à 16 ans",
  "créer une micro-entreprise à 18 ans", "créer une micro-entreprise étudiant", "déclarer ses revenus en ligne quand on est étudiant",
  "faut-il déclarer l'argent de TikTok", "payer des impôts sur l'argent gagné en ligne", "autorisation parentale pour travailler à 16 ans",
  "job étudiant en ligne", "job étudiant à distance", "petits boulots à 16 ans", "petits boulots à 15 ans", "job d'été à 16 ans",
  "travailler en ligne à 17 ans", "travailler depuis chez soi étudiant", "freelance à 18 ans", "freelance étudiant",
  "trouver des missions freelance quand on débute", "se lancer sur Malt sans expérience", "se lancer sur Fiverr en France",
  "organiser son temps entre les cours et son business", "lancer un business pendant le bac", "lancer un business pendant les études",
  "arrêter ses études pour son business", "convaincre ses parents de lancer son business", "lancer un business avec un ami",
  "trouver de la motivation pour son business", "rester discipliné quand on lance un business", "vaincre la peur de se lancer",
  "que faire quand son business ne marche pas", "combien de temps pour gagner de l'argent en ligne",
  "combien gagne un clipper", "combien gagne un monteur vidéo débutant", "combien gagne un créateur TikTok",
  "combien rapporte un SaaS", "combien rapporte un petit site internet", "combien rapporte une application",
  "combien rapporte un ebook", "combien rapporte le dropshipping", "combien rapporte l'affiliation",
  "idées de side business", "idées de business en ligne originales", "idées de business pour étudiant",
  "idées de business pour lycéen", "idées de business pour adolescent", "idées de business sans argent",
  "idées de business avec l'IA", "idées de business sur TikTok", "idées de business rentables en 2027",
  "idées de micro-SaaS", "idées de SaaS simples à créer", "idées d'applications qui rapportent",
  "idées de sites internet qui rapportent", "idées de produits numériques à vendre", "idées de services à vendre en ligne",
  "les métiers du digital accessibles sans diplôme", "les compétences qui rapportent en ligne", "apprendre à coder gratuitement",
  "apprendre le marketing digital gratuitement", "apprendre le montage vidéo gratuitement", "apprendre le copywriting",
  "les erreurs des débutants en business en ligne", "les meilleurs outils gratuits pour lancer un business",
  "les meilleures applications pour gagner de l'argent", "les applications qui payent vraiment", "les sites qui payent vraiment",
  "gagner de l'argent avec des sondages est-ce rentable", "gagner de l'argent en jouant est-ce possible",
  "gagner de l'argent en regardant des vidéos est-ce une arnaque", "gagner de l'argent avec les cryptos quand on est jeune",
  "gagner de l'argent en bourse à 18 ans", "argent de poche comment en gagner plus", "argent de poche à 15 ans combien",
];

export function jeunesTopics() {
  return [...AGES.flatMap(BY_AGE), ...SITUATIONS, ...AMOUNTS, ...QUESTIONS];
}
