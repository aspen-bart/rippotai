import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_HOURS, signSession, verifySession, type SessionPayload } from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  // Verwijderde gebruikers verliezen direct toegang.
  const user = await db.user.findUnique({ where: { id: session.sub }, select: { id: true } });
  return user ? session : null;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function startSession(user: { id: string; email: string; name: string }) {
  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
