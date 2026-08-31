import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "bgi_admin_session";
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || "dev-only-secret-change-in-production-please"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (!isAdminPath && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return redirectOrDeny(req, isAdminApi);
  }
  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return redirectOrDeny(req, isAdminApi);
  }
}

function redirectOrDeny(req: NextRequest, isApi: boolean) {
  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
