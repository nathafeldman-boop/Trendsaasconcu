"use client";

import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { OrDivider } from "@/components/auth/or-divider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-5"
    >
      <GoogleButton />
      <OrDivider />

      <Input label="Ton email" name="email" type="email" placeholder="camille@exemple.fr" autoComplete="email" required />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted"
          >
            Mot de passe
          </label>
          <Link
            href="#"
            className="font-body text-[12px] text-ink-faint underline underline-offset-2 hover:text-ink-muted"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-[52px] rounded-lg border border-white/12 bg-white/[0.03] px-4 font-body text-[15px] text-ink outline-none transition-colors duration-150 focus:border-accent/60 focus:bg-white/[0.05]"
        />
      </div>

      <Button type="submit" showArrow={false} className="mt-1 w-full">
        Me connecter
      </Button>
    </form>
  );
}
