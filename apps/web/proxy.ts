import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const guestOnlyRoutes = ["/login", "/register"];

function getSessionToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value
  );
}

async function isValidSession(
  sessionToken: string,
  request: NextRequest
): Promise<boolean> {
  const baseUrl = process.env.BETTER_AUTH_URL ?? request.nextUrl.origin;

  try {
    const response = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    return response.ok;
  } catch {
    // If the auth server is unreachable, assume the session is valid so we
    // don't cause redirect loops. The page itself can handle it gracefully.
    return true;
  }
}

function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = matchesRoutes(pathname, protectedRoutes);
  const isGuestOnly = matchesRoutes(pathname, guestOnlyRoutes);

  // Nothing to do for routes that aren't in either list
  if (!isProtected && !isGuestOnly) {
    return NextResponse.next();
  }

  const sessionToken = getSessionToken(request);

  // --- Protected routes: must be logged in ---
  if (isProtected) {
    if (!sessionToken || !(await isValidSession(sessionToken, request))) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // --- Guest-only routes: must NOT be logged in ---
  if (isGuestOnly) {
    if (sessionToken && (await isValidSession(sessionToken, request))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/).*)"],
};
