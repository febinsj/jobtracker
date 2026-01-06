import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Cookie name constants - must match auth.ts configuration
const SESSION_COOKIE_NAME = "authjs.session-token";
const SECURE_SESSION_COOKIE_NAME = "__Secure-authjs.session-token";

/**
 * Fix for NextAuth v5 signout issue on Netlify/Cloudflare
 *
 * During logout, NextAuth sends two Set-Cookie headers for the session token:
 * 1. One with an empty value (to delete the cookie)
 * 2. One with a valid token (from middleware refreshing the session)
 *
 * On Netlify, the header order differs from Vercel, causing the non-blank cookie
 * to appear last, which the browser uses - preventing logout.
 *
 * This fix filters out duplicate session cookies on signout, keeping only the
 * deletion cookie (empty value with Max-Age=0).
 *
 * See: https://github.com/nextauthjs/next-auth/issues/12909
 */
function fixSignOutCookies(response: Response, isSecure: boolean): Response {
  const setCookieHeaders = response.headers.getSetCookie();
  
  if (setCookieHeaders.length === 0) {
    return response;
  }

  const sessionCookieName = isSecure ? SECURE_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME;
  
  // Filter cookies: keep non-session cookies and only the deletion cookie for session
  const sessionCookies = setCookieHeaders.filter(cookie =>
    cookie.startsWith(sessionCookieName)
  );
  const nonSessionCookies = setCookieHeaders.filter(cookie =>
    !cookie.startsWith(sessionCookieName)
  );
  
  // Find the deletion cookie (has Max-Age=0 or empty value)
  const deletionCookie = sessionCookies.find(cookie =>
    cookie.includes("Max-Age=0") || cookie.includes(`${sessionCookieName}=;`)
  );

  // Create new response with fixed cookies
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });

  // Remove all Set-Cookie headers and re-add the correct ones
  newResponse.headers.delete("Set-Cookie");
  
  for (const cookie of nonSessionCookies) {
    newResponse.headers.append("Set-Cookie", cookie);
  }
  
  // Add only the deletion cookie for session token
  if (deletionCookie) {
    newResponse.headers.append("Set-Cookie", deletionCookie);
  } else if (sessionCookies.length > 0) {
    // If no deletion cookie found but we have session cookies,
    // manually create a deletion cookie
    const secure = isSecure ? "; Secure" : "";
    newResponse.headers.append(
      "Set-Cookie",
      `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
    );
  }

  return newResponse;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isSignOutRequest = pathname.startsWith("/api/auth/signout");
  const isSecure = req.nextUrl.protocol === "https:";

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/share/") ||
    pathname.startsWith("/shared/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/trpc/");

  // For signout requests, we need to handle the cookie fix
  if (isSignOutRequest) {
    // @ts-expect-error - auth() returns Response in middleware context when passed a request
    const response: Response = await auth(req);
    return fixSignOutCookies(response, isSecure);
  }

  // Get session for authentication checks
  const session = await auth();
  const isLoggedIn = !!session;

  // Redirect to sign-in if trying to access protected route while not logged in
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Redirect to dashboard if trying to access auth pages while logged in
  if (isLoggedIn && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};