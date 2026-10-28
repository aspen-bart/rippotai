"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/lib/actions/site";
import type { Dict } from "@/lib/dictionaries";
import { IconArrow, IconMail } from "./icons";

export function NewsletterForm({ dict }: { dict: Dict }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  if (state?.ok) return <p className="rounded-2xl bg-forest px-5 py-4 text-paper">{dict.footer.newsletterThanks}</p>;
  return (
    <form action={action} className="space-y-3">
      <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-sm ring-1 ring-forest/10 focus-within:ring-2 focus-within:ring-leaf">
        <IconMail className="shrink-0 text-muted" width={18} height={18} />
        <input type="email" name="email" required placeholder={dict.footer.newsletterPlaceholder} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" aria-label={dict.footer.newsletterPlaceholder} />
        <button className="btn-primary !px-5 !py-2.5" disabled={pending}>
          <span className="hidden sm:inline">{dict.footer.newsletterCta}</span>
          <IconArrow />
        </button>
      </div>
      <label className="flex items-start gap-2 text-xs text-forest/75">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-leaf" /> {dict.footer.consent1}
      </label>
      <label className="flex items-start gap-2 text-xs text-forest/75">
        <input type="checkbox" name="marketing" className="mt-0.5 accent-leaf" /> {dict.footer.consent2}
      </label>
      {state?.error && <p className="text-xs text-clay">{dict.contact.error}</p>}
    </form>
  );
}
