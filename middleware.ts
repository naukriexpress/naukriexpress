import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "bgi_admin_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (!isAdminPath && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return redirectOrDeny(req, isAdminApi);

  const configuredSecret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== "production" ? "local-development-secret-not-for-production" : "");

  if (!configuredSecret || (process.env.NODE_ENV === "production" && configuredSecret.length < 32)) {
    return redirectOrDeny(req, isAdminApi);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(configuredSecret), {
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin" || typeof payload.username !== "string") {
      return redirectOrDeny(req, isAdminApi);
    }
    return NextResponse.next();
  } catch {
    return redirectOrDeny(req, isAdminApi);
  }
}

function redirectOrDeny(req: NextRequest, isApi: boolean) {
  if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
