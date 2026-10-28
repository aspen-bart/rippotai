"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endSession, startSession } from "@/lib/auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/admin/rate-limit";

// Hash van een willekeurig wachtwoord, zodat een onbekend e-mailadres even lang duurt als een fout wachtwoord.
const DUMMY_HASH = bcrypt.hashSync("geen-geldig-account", 10);

export async function login(_prev: { error: string }, form: FormData): Promise<{ error: string }> {
  const ip = clientIp(await headers());
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Vul e-mailadres en wachtwoord in." };
  if (!rateLimit(`login:ip:${ip}`, 10, 15 * 60_000) || !rateLimit(`login:mail:${email}`, 5, 15 * 60_000)) {
    return { error: "Te veel inlogpogingen. Probeer het over 15 minuten opnieuw." };
  }
  const user = await db.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "Onjuist e-mailadres of wachtwoord." };

  resetRateLimit(`login:mail:${email}`);
  await startSession({ id: user.id, email: user.email, name: user.name ?? user.email });
  const next = String(form.get("next") ?? "/admin");
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
