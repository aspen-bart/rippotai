import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Inloggen" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ terug?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { terug } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-forest p-4">
      <div className="w-full max-w-sm rounded-3xl bg-paper p-8 shadow-2xl">
        <div className="text-center">
          <span className="text-2xl font-semibold tracking-tight text-forest">Rippotai</span>
          <span className="ml-2 rounded-full bg-sprout/40 px-2 py-0.5 align-middle text-[11px] font-semibold text-forest">Beheer</span>
        </div>
        <h1 className="mt-6 text-center text-sm text-muted">Log in om de webshop te beheren</h1>
        <LoginForm next={terug?.startsWith("/admin") ? terug : "/admin"} />
      </div>
    </main>
  );
}
