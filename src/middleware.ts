import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/"];

  // Check if the current path is a public route
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token (in a real app, this would be a JWT)
  const isAuthenticated =
    request.cookies.get("isAuthenticated")?.value === "true" ||
    request.headers.get("authorization");

  // Redirect to login if not authenticated
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
