import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "bgi_admin_session";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const configuredSecret = process.env.ADMIN_SESSION_SECRET;
const configuredUsername = process.env.ADMIN_USERNAME?.trim();
const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
const secretIsMisconfigured =
  IS_PRODUCTION &&
  (!configuredSecret ||
    configuredSecret.length < 32 ||
    /(change-this|replace-with|dev-only|example-secret)/i.test(configuredSecret) ||
    !configuredUsername ||
    configuredUsername === "change-this-admin-username" ||
    !configuredPasswordHash ||
    !/^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$/.test(configuredPasswordHash));
const SECRET = new TextEncoder().encode(
  configuredSecret || (IS_PRODUCTION ? "" : "dev-only-secret-change-in-production-please")
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (!isAdminPath && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || secretIsMisconfigured) {
    return redirectOrDeny(req, isAdminApi);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    if (payload.role !== "admin" || typeof payload.username !== "string") {
      return redirectOrDeny(req, isAdminApi);
    }
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
