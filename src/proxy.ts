import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "yatrion_session";

function getProxySessionKey(): Uint8Array {
  const isProduction = process.env.NODE_ENV === "production";
  const secret = process.env.SESSION_SECRET;

  if (isProduction) {
    if (!secret || secret.trim().length < 32) {
      throw new Error(
        "[Yatrion Security] Fatal: A secure SESSION_SECRET of at least 32 characters is required in production mode."
      );
    }
    return new TextEncoder().encode(secret);
  }

  return new TextEncoder().encode(
    secret || "yatrion-karnataka-auth-secret-key-2026-zero-cost-hackathon-token"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const encodedSecretKey = getProxySessionKey();
      const { payload } = await jwtVerify(sessionCookie, encodedSecretKey, {
        algorithms: ["HS256"],
      });
      if (payload && typeof payload.userId === "string") {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Guard /app/* routes: require active session
  if (pathname.startsWith("/app")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      const safeReturn = pathname + (request.nextUrl.search || "");
      loginUrl.searchParams.set("redirect", safeReturn);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Redirect already-authenticated users visiting /login or /signup to dashboard
  if (pathname === "/login" || pathname === "/signup") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export { proxy as middleware };

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
