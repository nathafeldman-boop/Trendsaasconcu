import { STREAK_BONUS_CENTS, formatEuros } from "@/lib/creators/program";
import type { CreatorAccount } from "@/lib/creators/store";

// The reminders to post, sent three times a day (app/api/creators/reminders)
// to creators who haven't posted yet that day. Each one links to their page
// and to a one-click stop.

export type ReminderSlot = 1 | 2 | 3;

export function reminderEmail(creator: CreatorAccount, slot: ReminderSlot, origin: string) {
  const first = creator.name.split(" ")[0] || "toi";
  const page = `${origin}/createurs/${creator.token}`;
  const stop = `${origin}/api/creators/reminders/stop?token=${encodeURIComponent(creator.token)}`;
  const run = creator.streak.current;
  const jokers = creator.streak.jokersLeft;
  const series = run > 0 ? `ta série de ${run} jour${run > 1 ? "s" : ""}` : "ta série";

  const copy: Record<ReminderSlot, { subject: string; lines: string[] }> = {
    1: {
      subject: run > 0 ? `🔥 ${run} jour${run > 1 ? "s" : ""} d'affilée : ta vidéo du jour ?` : "🔥 Ta vidéo du jour ?",
      lines: [
        `Salut ${first} !`,
        `Nouvelle journée, nouvelle vidéo : poste-la aujourd'hui pour garder ${series}.`,
        `Une vidéo par jour tout le mois = ${formatEuros(STREAK_BONUS_CENTS)} de bonus, en plus de tes vues.`,
      ],
    },
    2: {
      subject: `⏳ Pas encore de vidéo aujourd'hui, ${first}`,
      lines: [
        `Hello ${first}, on n'a pas encore vu ta vidéo du jour.`,
        `Il te reste la soirée : filme la simulation (saasfounder.fr/simulation), poste, et colle le lien sur ta page.`,
        `Ça te prend 10 minutes et ça garde ${series}.`,
      ],
    },
    3: {
      subject: `🚨 Dernier rappel : ${series} se joue ce soir`,
      lines: [
        `${first}, dernier rappel de la journée : poste ta vidéo avant minuit.`,
        jokers > 0
          ? `Pas possible aujourd'hui (malade, pas le temps) ? Pas de panique : il te reste ${jokers} joker${jokers > 1 ? "s" : ""} ce mois-ci, ta série continue. Astuce : prépare 2 ou 3 brouillons d'avance pour ces jours-là.`
          : `Attention : tu as déjà utilisé tes 2 jokers ce mois-ci, un jour sans vidéo casse ta série.`,
      ],
    },
  };

  const { subject, lines } = copy[slot];
  const text = [...lines, "", `Ta page : ${page}`, "", `Ne plus recevoir ces rappels : ${stop}`].join("\n");
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.55;color:#111;max-width:520px">
${lines.map((l) => `<p style="margin:0 0 14px">${escapeHtml(l)}</p>`).join("\n")}
<p style="margin:22px 0"><a href="${page}" style="background:#111;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Ajouter ma vidéo du jour</a></p>
<p style="margin:28px 0 0;font-size:12px;color:#888"><a href="${stop}" style="color:#888">Ne plus recevoir ces rappels</a></p>
</div>`;
  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
