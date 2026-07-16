import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Forward the current pathname into a request header so Server Components
 * (e.g. the authenticated app layout) can build a correct login callbackUrl.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/timeline/:path*",
    "/settings/:path*",
    "/generate/:path*",
    "/login",
  ],
};
