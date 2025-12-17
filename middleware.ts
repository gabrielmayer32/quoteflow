import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/", "/login", "/signup", "/intake", "/approve"];

// CORS configuration
const allowedOrigins = [
  "https://www.flowquote.io",
  "https://flowquote.io",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
].filter(Boolean) as string[];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle CORS for API routes
  if (pathname.startsWith("/api")) {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Add CORS headers to API responses
    const response = NextResponse.next();
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    return response;
  }

  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
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
