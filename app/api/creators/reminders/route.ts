import { NextResponse } from "next/server";
import { listCreatorAccounts } from "@/lib/creators/store";
import { parisDay } from "@/lib/creators/program";
import { reminderEmail, type ReminderSlot } from "@/lib/email/creator-reminder";
import { sendEmail } from "@/lib/email/send";
import { SITE_URL } from "@/lib/site";

// Called three times a day by pg_cron (migration 0031): reminds every
// creator with an email, who hasn't turned reminders off and hasn't posted
// yet today, to post. Each reminder goes out at most once per creator, day
// and slot (Resend idempotency), so calling it again sends nothing new.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function slotNow(): ReminderSlot {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }).format(new Date()));
  return hour < 14 ? 1 : hour < 19 ? 2 : 3;
}

export async function GET() {
  const today = parisDay(new Date());
  const slot = slotNow();
  const creators = (await listCreatorAccounts()).filter((c) => c.email && !c.reminders_off_at && !c.streak.postedToday);
  let sent = 0;
  for (const creator of creators) {
    const email = reminderEmail(creator, slot, SITE_URL);
    const ok = await sendEmail({ to: creator.email!, ...email, idempotencyKey: `creator-reminder-${creator.id}-${today}-${slot}` });
    if (ok) sent++;
  }
  return NextResponse.json({ slot, eligible: creators.length, sent });
}
