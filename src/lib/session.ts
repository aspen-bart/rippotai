// JWT-sessies voor het beheerpaneel. Bewust zonder Node-API's zodat middleware (edge) dit ook kan gebruiken.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "rp_session";
export const SESSION_HOURS = 8;

export type SessionPayload = { sub: string; email: string; name: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET ontbreekt of is korter dan 32 tekens");
    return new TextEncoder().encode("dev-only-secret-please-change-me-0123456789");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
