import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PaymentMethodForm } from "@/components/admin/forms/PaymentMethodForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, Empty, PageHeader, Panel, btnSm, btnSmDanger } from "@/components/admin/ui";
import { deletePaymentMethod, movePaymentMethod, togglePaymentMethod } from "@/app/admin/actions/payments";

export const metadata = { title: "Betaalmethoden" };

export default async function PaymentMethodsPage() {
  await requireUser();
  const methods = await db.paymentMethod.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const active = methods.filter((m) => m.enabled);
  return (
    <>
      <PageHeader title="Betaalmethoden" description="Logo's die in de footer en bij het afrekenen getoond worden" />

      <Panel title="Zo ziet het eruit" className="mb-6">
        <div className="flex flex-wrap gap-2 rounded-xl bg-forest p-4">
          {active.length ? (
            active.map((m) => <span key={m.id} title={m.name} className="[&_svg]:h-6 [&_svg]:w-auto" dangerouslySetInnerHTML={{ __html: m.svg }} />)
          ) : (
            <span className="text-sm text-paper/60">Geen actieve betaalmethoden.</span>
          )}
        </div>
      </Panel>

      {methods.length === 0 ? (
        <Empty>Nog geen betaalmethoden.</Empty>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <ul className="divide-y divide-line">
            {methods.map((m, i) => (
              <li key={m.id} className={m.enabled ? "" : "bg-paper/50"}>
                <div className="flex flex-wrap items-center gap-3 p-3">
                  <span className={`grid h-10 w-16 place-items-center [&_svg]:h-6 [&_svg]:w-auto ${m.enabled ? "" : "opacity-40 grayscale"}`} dangerouslySetInnerHTML={{ __html: m.svg }} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-forest">{m.name}</span>
                    <span className="block font-mono text-xs text-muted">{m.key}</span>
                  </span>
                  {m.enabled ? <Badge tone="success">Actief</Badge> : <Badge>Uit</Badge>}
                  <form action={togglePaymentMethod}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitButton className={btnSm}>{m.enabled ? "Uitzetten" : "Aanzetten"}</SubmitButton>
                  </form>
                  <form action={movePaymentMethod} className="flex gap-1">
                    <input type="hidden" name="id" value={m.id} />
                    <button name="dir" value="up" className={btnSm} disabled={i === 0} title="Omhoog">
                      ↑
                    </button>
                    <button name="dir" value="down" className={btnSm} disabled={i === methods.length - 1} title="Omlaag">
                      ↓
                    </button>
                  </form>
                  <form action={deletePaymentMethod}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitButton className={btnSmDanger} confirm={`${m.name} verwijderen?`}>
                      Verwijderen
                    </SubmitButton>
                  </form>
                </div>
                <details className="group border-t border-line/60 px-3 py-2">
                  <summary className="cursor-pointer text-xs text-muted hover:text-forest">Naam of logo bewerken</summary>
                  <div className="py-3">
                    <PaymentMethodForm method={{ id: m.id, name: m.name, svg: m.svg }} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Panel title="Nieuwe betaalmethode" className="mt-6">
        <PaymentMethodForm />
      </Panel>
    </>
  );
}
