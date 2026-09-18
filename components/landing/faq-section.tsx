import { Eyebrow } from "@/components/ui/eyebrow";
import { Accordion, type AccordionItemData } from "@/components/ui/accordion";

const FAQ_ITEMS: AccordionItemData[] = [
  {
    question: "Je ne sais pas coder, ça marche quand même ?",
    answer:
      "Oui. Le prompt est pensé pour piloter un outil d'IA qui écrit le code à ta place. Ton travail, c'est de suivre le plan et de prendre les décisions produit.",
  },
  {
    question: "Pourquoi me demander de créer un compte ?",
    answer:
      "Pour sauvegarder ton idée, ton prompt et ton plan quelque part, et te les renvoyer par email plutôt que de les perdre en fermant l'onglet.",
  },
  {
    question: "Combien de temps avant d'avoir un résultat ?",
    answer:
      "Le plan est calibré sur 30 jours, avec une action concrète à chaque étape. Certains vont plus vite, d'autres prennent plus de temps — l'objectif est d'avancer, pas de sprinter.",
  },
  {
    question: "Les chiffres du dashboard, ils viennent d'où ?",
    answer:
      "Ceux affichés en exemple sur cette page sont fictifs, pour montrer à quoi ressemble l'interface. Une fois lancé, tu connectes ta propre clé Stripe en lecture seule et c'est ton volume, ton MRR et tes paiements réels qui s'affichent.",
  },
  {
    question: "Est-ce que mon idée est aussi donnée à d'autres ?",
    answer:
      "Non. Les idées sont sélectionnées selon tes réponses, pas distribuées au hasard de la même façon à tout le monde.",
  },
  {
    question: "Ça coûte combien ?",
    answer:
      "La méthode est gratuite pour commencer. Tu verras clairement ce qui est inclus avant de payer quoi que ce soit.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <Eyebrow>Objections</Eyebrow>
      <h2 className="mt-5 font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[38px]">
        Les questions qu&apos;on nous pose souvent
      </h2>
      <div className="mt-10">
        <Accordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
