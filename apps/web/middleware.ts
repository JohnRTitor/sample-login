import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // better-auth stores the session token in a cookie named
  // "better-auth.session_token" (or "__Secure-better-auth.session_token" when
  // using HTTPS in production). We check for both variants.
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate the session token by calling the better-auth session endpoint.
  // This ensures expired / revoked tokens are caught, not just missing cookies.
  const baseUrl =
    process.env.BETTER_AUTH_URL ?? request.nextUrl.origin;

  try {
    const response = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!response.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // If the auth server is unreachable, let the request through so the page
    // can handle it gracefully rather than showing a redirect loop.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/).*)"],
};