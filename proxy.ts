import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "dashboard_session";

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isRegisterPage = request.nextUrl.pathname === "/register";
  const isProtectedPage =
    request.nextUrl.pathname === "/admin" || request.nextUrl.pathname === "/orders";
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isProtectedPage && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((isLoginPage || isRegisterPage) && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/orders", "/login", "/register"],
};
