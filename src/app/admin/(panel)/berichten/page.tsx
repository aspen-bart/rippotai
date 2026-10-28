import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, Empty, PageHeader, Panel, btnSm, btnSmDanger, fmtDateTime } from "@/components/admin/ui";
import { deleteMessage, deleteSubscriber, markAllMessagesRead, setMessageRead } from "@/app/admin/actions/messages";

export const metadata = { title: "Berichten" };

export default async function MessagesPage() {
  await requireUser();
  const [messages, subscribers] = await Promise.all([
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const unread = messages.filter((m) => !m.read).length;
  return (
    <>
      <PageHeader
        title="Berichten"
        description={`${messages.length} contactberichten, ${unread} ongelezen`}
        action={
          unread > 0 && (
            <form action={markAllMessagesRead}>
              <SubmitButton className={btnSm}>Alles als gelezen markeren</SubmitButton>
            </form>
          )
        }
      />
      {messages.length === 0 ? (
        <Empty>Nog geen contactberichten.</Empty>
      ) : (
        <div className="grid gap-3">
          {messages.map((m) => (
            <article id={m.id} key={m.id} className={`scroll-mt-6 rounded-2xl border bg-white p-4 sm:p-5 ${m.read ? "border-line" : "border-leaf/50 ring-1 ring-leaf/20"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-forest">
                    {m.name} {!m.read && <Badge tone="danger">Nieuw</Badge>}
                  </p>
                  <p className="text-xs text-muted">
                    <a href={`mailto:${m.email}`} className="text-leaf-dark hover:underline">
                      {m.email}
                    </a>
                    {m.phone && <> · {m.phone}</>}
                    {m.company && <> · {m.company}</>} · {fmtDateTime(m.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <form action={setMessageRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="read" value={m.read ? "0" : "1"} />
                    <SubmitButton className={btnSm}>{m.read ? "Markeer ongelezen" : "Markeer gelezen"}</SubmitButton>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitButton className={btnSmDanger} confirm="Bericht verwijderen?">
                      Verwijderen
                    </SubmitButton>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink/85">{m.message}</p>
            </article>
          ))}
        </div>
      )}

      <div id="nieuwsbrief" className="mt-10 scroll-mt-6">
        <Panel title={`Nieuwsbrief (${subscribers.length})`}>
          <div className="mb-4 flex justify-end">
            <a href="/api/admin/newsletter" className="btn-primary px-4 py-2" download>
              Exporteer CSV
            </a>
          </div>
          {subscribers.length === 0 ? (
            <p className="text-sm text-muted">Nog geen inschrijvingen.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {subscribers.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    {s.email} {s.marketing && <Badge tone="success">marketing</Badge>}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-muted">
                    {fmtDateTime(s.createdAt)}
                    <form action={deleteSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <SubmitButton className="text-clay hover:underline" confirm={`${s.email} uitschrijven?`}>
                        Verwijderen
                      </SubmitButton>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
