import { NextResponse, type NextRequest } from "next/server";

/**
 * Schneller Vorab-Check: ohne Sitzungs-Cookie direkt zur Anmeldung.
 * Ob die Sitzung wirklich gültig ist, prüft danach die API bei jeder Anfrage.
 */
export default function proxy(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get("lume_session")?.value);
  if (!hasSession) {
    const url = new URL("/login", req.nextUrl);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
