/**
 * Reject unsafe browser mutations initiated from a different origin.
 * Non-browser clients may omit Origin/Referer, but still need a valid admin session.
 */
export function isSameOriginMutation(request: Request): boolean {
  const requestUrl = new URL(request.url);
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin === requestUrl.origin;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === requestUrl.origin;
    } catch {
      return false;
    }
  }

  return true;
}
