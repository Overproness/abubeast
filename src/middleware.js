import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth/jwt";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/trading", "/swap"];

export async function middleware(request) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes and public files
  if (
    path.startsWith("/api/") ||
    path.includes(".") ||
    path.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Path ${path}`);

  // Check if we're on a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get token from cookies - use 'auth-token' instead of 'token'
    const token =
      request.cookies.get("auth-token")?.value ||
      request.cookies.get("token")?.value;

    if (!token) {
      console.log(`[Middleware] No token found for protected route ${path}`);
      // Redirect to login instead of just proceeding
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`[Middleware] Path ${path}: Token exists`);

    try {
      // Verify the token with our Edge-compatible function
      const decoded = verifyToken(token);

      if (!decoded) {
        console.log(`[Middleware] Invalid token for ${path}`);
        // Redirect to login for invalid token
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("from", path);
        return NextResponse.redirect(loginUrl);
      }

      console.log(
        `[Middleware] Valid token for ${
          decoded.email || decoded.id
        }, proceeding to ${path}`
      );

      // Create a new response
      const response = NextResponse.next();

      // Add auth info to headers that can be read by the client
      response.headers.set(
        "x-auth-user-id",
        decoded.id || decoded.userId || ""
      );
      response.headers.set("x-auth-user-email", decoded.email || "");
      response.headers.set("x-auth-status", "authenticated");

      return response;
    } catch (error) {
      console.error(
        `[Middleware] Token verification error for ${path}:`,
        error.message
      );
      // Redirect to login on verification error
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for those starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
