"use client";

import { useState } from "react";
import type { Currency } from "@/lib/settings-defaults";
import { saveCurrency } from "@/app/admin/actions/settings";
import { FormMessage } from "../FormMessage";
import { move } from "../ImageListEditor";
import { SubmitButton } from "../SubmitButton";
import { useAdminForm } from "../useAdminForm";
import { Panel, btnSm, fieldSm } from "../ui";

type Row = Omit<Currency, "rate"> & { rate: string };

function flagEmoji(code: string) {
  if (!/^[a-z]{2}$/i.test(code)) return "🏳️";
  if (code.toLowerCase() === "eu") return "🇪🇺";
  return String.fromCodePoint(...code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function CurrencyForm({ initial }: { initial: Currency[] }) {
  const { state, pending, onSubmit } = useAdminForm(saveCurrency);
  const [rows, setRows] = useState<Row[]>(initial.map((c) => ({ ...c, rate: String(c.rate) })));
  const set = (i: number, p: Partial<Row>) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...p } : r)));
  const payload = rows.map((r) => ({ ...r, rate: r.rate.replace(",", ".") }));

  return (
    <form method="post" onSubmit={onSubmit}>
      <input type="hidden" name="currencies" value={JSON.stringify(payload)} />
      <FormMessage state={state} />
      <Panel title="Valuta">
        <p className="mb-4 text-xs text-muted">
          Er wordt altijd in EUR afgerekend; andere valuta zijn alleen voor weergave. Wisselkoers = hoeveel van de valuta 1 euro waard is (bv. USD 1,12).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">Vlag</th>
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium">Naam IT</th>
                <th className="pb-2 font-medium">Naam EN</th>
                <th className="pb-2 font-medium">Symbool</th>
                <th className="pb-2 font-medium">Koers t.o.v. EUR</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const base = r.code === "EUR";
                return (
                  <tr key={i} className="align-middle">
                    <td className="py-1 pr-2">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{flagEmoji(r.flag)}</span>
                        <input value={r.flag} onChange={(e) => set(i, { flag: e.target.value })} className={`${fieldSm} w-14`} maxLength={2} aria-label="Vlag-code" />
                      </div>
                    </td>
                    <td className="py-1 pr-2">
                      <input value={r.code} onChange={(e) => set(i, { code: e.target.value.toUpperCase() })} className={`${fieldSm} w-20 font-mono`} maxLength={3} readOnly={base} aria-label="Code" />
                    </td>
                    <td className="py-1 pr-2">
                      <input value={r.name.it} onChange={(e) => set(i, { name: { ...r.name, it: e.target.value } })} className={fieldSm} aria-label="Naam IT" />
                    </td>
                    <td className="py-1 pr-2">
                      <input value={r.name.en} onChange={(e) => set(i, { name: { ...r.name, en: e.target.value } })} className={fieldSm} aria-label="Naam EN" />
                    </td>
                    <td className="py-1 pr-2">
                      <input value={r.symbol} onChange={(e) => set(i, { symbol: e.target.value })} className={`${fieldSm} w-20`} aria-label="Symbool" />
                    </td>
                    <td className="py-1 pr-2">
                      <input value={base ? "1" : r.rate} onChange={(e) => set(i, { rate: e.target.value })} className={`${fieldSm} w-28`} inputMode="decimal" readOnly={base} aria-label="Wisselkoers" />
                    </td>
                    <td className="whitespace-nowrap py-1">
                      {base ? (
                        <span className="text-xs text-muted">basis</span>
                      ) : (
                        <span className="flex gap-1">
                          <button type="button" className={btnSm} disabled={i <= 1} onClick={() => setRows((rs) => move(rs, i, -1))} title="Omhoog">
                            ↑
                          </button>
                          <button type="button" className={btnSm} disabled={i === rows.length - 1} onClick={() => setRows((rs) => move(rs, i, 1))} title="Omlaag">
                            ↓
                          </button>
                          <button type="button" className={`${btnSm} text-clay`} onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))} title="Verwijderen">
                            ✕
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btnSm} onClick={() => setRows((rs) => [...rs, { code: "", name: { it: "", en: "" }, symbol: "", rate: "1", flag: "" }])}>
            + Valuta toevoegen
          </button>
          <SubmitButton pending={pending} pendingText="Opslaan…" className="btn-primary ml-auto px-5 py-2">
            Valuta opslaan
          </SubmitButton>
        </div>
      </Panel>
    </form>
  );
}
