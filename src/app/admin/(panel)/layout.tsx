import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const unread = await db.contactMessage.count({ where: { read: false } });
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col bg-forest p-4 text-paper lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">Rippotai</span>
          <span className="rounded-full bg-sprout/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sprout">Beheer</span>
        </Link>
        <AdminNav unread={unread} />
        <div className="mt-4 border-t border-paper/10 pt-4 text-sm lg:mt-auto">
          <p className="font-medium">{session.name}</p>
          <p className="truncate text-xs text-paper/50">{session.email}</p>
          <div className="mt-3 flex gap-2">
            <a href="/it-it" target="_blank" rel="noreferrer" className="rounded-full border border-paper/20 px-3 py-1.5 text-xs hover:bg-paper/10">
              Website ↗
            </a>
            <form action={logout}>
              <button className="rounded-full border border-paper/20 px-3 py-1.5 text-xs hover:bg-paper/10">Uitloggen</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
