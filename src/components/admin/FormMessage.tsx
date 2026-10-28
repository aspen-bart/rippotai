"use client";

import { useSearchParams } from "next/navigation";

/** Toont foutmelding uit de action-state, of "opgeslagen" na een redirect met ?opgeslagen=1. */
export function FormMessage({ state }: { state: { error?: string; ok?: string } }) {
  const params = useSearchParams();
  if (state.error) return <p className="mb-5 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">{state.error}</p>;
  if (state.ok) return <p className="mb-5 rounded-xl bg-leaf/10 px-4 py-3 text-sm text-leaf-dark" role="status">{state.ok}</p>;
  if (params.get("opgeslagen")) return <p className="mb-5 rounded-xl bg-leaf/10 px-4 py-3 text-sm text-leaf-dark" role="status">Opgeslagen.</p>;
  return null;
}
