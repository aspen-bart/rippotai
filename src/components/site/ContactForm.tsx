"use client";

import { useActionState } from "react";
import { sendContact } from "@/lib/actions/site";
import type { Dict } from "@/lib/dictionaries";
import { IconArrow, IconSeed } from "./icons";

export function ContactForm({ dict, privacy }: { dict: Dict["contact"]; privacy: string }) {
  const [state, action, pending] = useActionState(sendContact, null);
  if (state?.ok)
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-sprout/40 text-leaf-dark">
          <IconSeed width={30} height={30} />
        </span>
        <p className="font-display text-2xl text-forest">{dict.sent}</p>
      </div>
    );
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label={dict.name} name="name" required className="sm:col-span-2" />
      <Field label={dict.email} name="email" type="email" required />
      <Field label={dict.phone} name="phone" type="tel" />
      <Field label={dict.company} name="company" className="sm:col-span-2" />
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm text-forest">{dict.message} *</span>
        <textarea name="message" required rows={5} className="field resize-y" />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex items-start gap-2 text-xs text-muted sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-leaf" /> {privacy}
      </label>
      {state?.error && <p className="text-sm text-clay sm:col-span-2">{dict.error}</p>}
      <button className="btn-primary sm:col-span-2" disabled={pending}>
        {dict.send} <IconArrow />
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required, className = "" }: { label: string; name: string; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm text-forest">
        {label}
        {required && " *"}
      </span>
      <input name={name} type={type} required={required} className="field" />
    </label>
  );
}
