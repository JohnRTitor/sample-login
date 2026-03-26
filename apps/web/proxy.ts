import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// ─── Route Configuration ────────────────────────────────────────────────────

/** Routes that require an authenticated session. */
const PROTECTED_ROUTES = ["/dashboard"] as const;

/** Routes that are only accessible to unauthenticated users. */
const GUEST_ONLY_ROUTES = ["/login", "/register"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

type RouteList = readonly string[];

/**
 * Check whether a pathname matches any route in the list.
 * Matches both exact paths and nested sub-paths (e.g. "/dashboard/settings").
 */
function matchesRoute(pathname: string, routes: RouteList): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// ─── Proxy ───────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = matchesRoute(pathname, PROTECTED_ROUTES);
  const isGuestOnly = matchesRoute(pathname, GUEST_ONLY_ROUTES);

  // Skip session fetch entirely for unmatched routes
  if (!isProtected && !isGuestOnly) {
    return NextResponse.next();
  }

  // Full server-side session validation (DB check, not just cookie)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // --- Guest-only routes: redirect authenticated users away ---
  if (isGuestOnly) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // --- Protected routes: redirect unauthenticated users to login ---
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot)|api/).*)",
  ],
};
