"use client";

import { useActionState } from "react";
import { login } from "../actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="mt-6 grid gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted">E-mailadres</span>
        <input name="email" type="email" required autoComplete="username" className="field" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted">Wachtwoord</span>
        <input name="password" type="password" required autoComplete="current-password" className="field" />
      </label>
      {state.error && <p className="rounded-xl bg-clay/10 p-3 text-sm text-clay">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Bezig…" : "Inloggen"}
      </button>
    </form>
  );
}
