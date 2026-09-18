"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";

const STATS = [
  { value: 20, suffix: "", label: "idées de SaaS validées, détaillées et prêtes à builder" },
  { value: 18, suffix: "", label: "questions pour cerner ta situation réelle" },
  { value: 650, prefix: "~", label: "mots de prompt, prêts à coller dans ton IA" },
  { value: 30, suffix: "", label: "jours de plan, action concrète par action" },
];

export function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid grid-cols-2 border-t border-l border-ink/10">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="border-r border-b border-ink/10 px-6 py-8 sm:px-10 sm:py-10"
          >
            <p className="font-display text-4xl font-semibold text-ink sm:text-5xl">
              <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="mt-3 max-w-[22ch] font-body text-[14px] leading-snug text-ink-muted">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
