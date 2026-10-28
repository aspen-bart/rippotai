import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// 1) /admin afschermen: zonder geldige sessie naar het inlogscherm (pagina's en server actions controleren zelf ook).
// 2) URL's zonder taalprefix (zoals op de oude Shopify-site) doorsturen naar de Italiaanse versie.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?terug=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/" || /^\/(collections|products|pages|cart|search)(\/|$)/.test(pathname)) {
    const url = req.nextUrl.clone();
    const lang = req.cookies.get("rp_lang")?.value === "en" ? "en-it" : "it-it";
    url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, pathname === "/" ? 307 : 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*", "/collections/:path*", "/products/:path*", "/pages/:path*", "/cart", "/search"],
};
