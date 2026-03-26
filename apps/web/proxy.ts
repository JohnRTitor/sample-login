import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

/** Routes that require an authenticated session. */
const PROTECTED_ROUTES = ["/dashboard"] as const;

/** Routes that are only accessible to unauthenticated users. */
const GUEST_ONLY_ROUTES = ["/login", "/register"] as const;

/** Default redirect targets. */
const ROUTES = {
  loginPage: "/login",
  afterLogin: "/dashboard",
  callbackParam: "callbackUrl",
} as const;

// ---------------------------------------------------------------------------
// Session validation
// ---------------------------------------------------------------------------

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

/** How long to wait for the auth server before giving up (ms). */
const SESSION_VALIDATION_TIMEOUT_MS = 3_000;

/** Simple in-process cache to avoid hammering the auth endpoint on every request. */
const sessionCache = new Map<string, { valid: boolean; expiresAt: number }>();
const SESSION_CACHE_TTL_MS = 30_000; // 30 s

function getSessionToken(request: NextRequest): string | undefined {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = request.cookies.get(name)?.value;
    if (value) return value;
  }
  return undefined;
}

async function isValidSession(
  sessionToken: string,
  request: NextRequest
): Promise<boolean> {
  // 1. Check the short-lived in-process cache first.
  const cached = sessionCache.get(sessionToken);
  if (cached && Date.now() < cached.expiresAt) {
    console.log("[middleware] session cache hit", {
      tokenSuffix: sessionToken.slice(-6),
      valid: cached.valid,
      expiresAt: cached.expiresAt,
      now: Date.now(),
    });
    return cached.valid;
  }
  console.log("[middleware] session cache miss", {
    tokenSuffix: sessionToken.slice(-6),
    now: Date.now(),
  });

  const baseUrl =
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? request.nextUrl.origin;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    SESSION_VALIDATION_TIMEOUT_MS
  );

  try {
    const tokenSuffix = sessionToken.slice(-6);
    console.log("[middleware] validating session", {
      tokenSuffix,
      baseUrl,
      pathname: request.nextUrl.pathname,
    });

    const response = await fetch(`${baseUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        // Forward both possible cookie names so the server always recognises it.
        cookie: SESSION_COOKIE_NAMES.map((n) => `${n}=${sessionToken}`).join(
          "; "
        ),
      },
      signal: controller.signal,
      // Opt out of Next.js's default fetch cache — session state must be fresh.
      cache: "no-store",
    });

    const valid = response.ok;
    console.log("[middleware] validation response", {
      tokenSuffix,
      status: response.status,
      ok: response.ok,
    });

    // 2. Populate the cache with the result.
    sessionCache.set(sessionToken, {
      valid,
      expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
    });
    console.log("[middleware] caching validation result", {
      tokenSuffix,
      valid,
      expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
    });

    return valid;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(
        "[middleware] Session validation timed out — allowing through."
      );
    } else {
      console.error("[middleware] Session validation error:", error);
    }
    // Fail open: let the downstream page handle the invalid session gracefully
    // rather than causing a redirect loop when the auth server is unavailable.
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Route matching
// ---------------------------------------------------------------------------

function matchesRoutes(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL(ROUTES.loginPage, request.url);
  loginUrl.searchParams.set(ROUTES.callbackParam, pathname);
  console.log("[middleware] redirectToLogin", {
    pathname,
    loginUrl: loginUrl.toString(),
  });
  return NextResponse.redirect(loginUrl);
}

function redirectAfterLogin(request: NextRequest): NextResponse {
  // Respect a ?callbackUrl param if it was set on the guest-only page.
  const callbackUrl = request.nextUrl.searchParams.get(ROUTES.callbackParam);
  const destination =
    callbackUrl && callbackUrl.startsWith("/")
      ? callbackUrl
      : ROUTES.afterLogin;
  console.log("[middleware] redirectAfterLogin", {
    callbackUrl,
    destination,
  });
  return NextResponse.redirect(new URL(destination, request.url));
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export default async function middleware(
  request: NextRequest
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isProtected = matchesRoutes(pathname, PROTECTED_ROUTES);
  const isGuestOnly = matchesRoutes(pathname, GUEST_ONLY_ROUTES);

  console.log("[middleware] start", {
    pathname,
    isProtected,
    isGuestOnly,
    search: request.nextUrl.search,
  });

  // Fast path: nothing to do for unguarded routes.
  if (!isProtected && !isGuestOnly) {
    console.log("[middleware] unguarded route, allowing", { pathname });
    return NextResponse.next();
  }

  const sessionToken = getSessionToken(request);
  console.log("[middleware] session token lookup", {
    pathname,
    hasToken: Boolean(sessionToken),
    tokenSuffix: sessionToken ? sessionToken.slice(-6) : undefined,
  });
  const authenticated =
    sessionToken != null && (await isValidSession(sessionToken, request));
  console.log("[middleware] route decision", {
    pathname,
    isProtected,
    isGuestOnly,
    authenticated,
  });

  // --- Protected routes: must be logged in ---
  if (isProtected && !authenticated) {
    return redirectToLogin(request, pathname);
  }

  // --- Guest-only routes: must NOT be logged in ---
  if (isGuestOnly && authenticated) {
    return redirectAfterLogin(request);
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher config
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Run on every route EXCEPT:
     *  - Next.js internals (_next/static, _next/image)
     *  - Static file extensions (images, fonts, icons, manifests)
     *  - API routes (handled server-side; no redirect needed)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot)|api/).*)",
  ],
};
