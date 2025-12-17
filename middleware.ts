import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/", "/login", "/signup", "/intake", "/approve"];

// CORS configuration
const allowedOrigins = [
  "https://www.flowquote.io",
  "https://flowquote.io",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
].filter(Boolean) as string[];

function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const pathname = request.nextUrl.pathname;

  // Only apply CORS to API routes
  if (!pathname.startsWith("/api")) {
    return null;
  }

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return null;
}

function addCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle CORS preflight before anything else
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return corsResponse;
  }

  // Skip auth for API routes and _next
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    const response = NextResponse.next();
    // Add CORS headers to API responses
    if (pathname.startsWith("/api")) {
      return addCorsHeaders(response, origin);
    }
    return response;
  }

  const isPublicPath = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isPublicPath && !request.auth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.auth && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
