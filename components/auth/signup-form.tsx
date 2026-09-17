"use client";

import { GoogleButton } from "@/components/auth/google-button";
import { OrDivider } from "@/components/auth/or-divider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-5"
    >
      <GoogleButton />
      <OrDivider />

      <Input label="Ton prénom" name="firstName" placeholder="Camille" autoComplete="given-name" required />
      <Input label="Ton email" name="email" type="email" placeholder="camille@exemple.fr" autoComplete="email" required />
      <Input label="Un mot de passe" name="password" type="password" placeholder="8 caractères minimum" autoComplete="new-password" required />

      <p className="font-body text-[13px] leading-relaxed text-ink-faint">
        Ton prénom personnalise ton espace, ton email sert uniquement à te
        renvoyer ton idée et ton plan.
      </p>

      <Button type="submit" showArrow={false} className="mt-1 w-full">
        Créer mon compte Élan
      </Button>

      <p className="text-center font-body text-[12px] leading-relaxed text-ink-faint">
        En créant ton compte, tu acceptes nos{" "}
        <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
          conditions d&apos;utilisation
        </a>{" "}
        et notre{" "}
        <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  );
}
