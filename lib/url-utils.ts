/**
 * Removes only the ChatGPT source tracking parameter from a URL.
 * Preserves the original URL and all other query parameters.
 */
function decodeQueryComponent(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

export function stripChatGptUtmSource(value: string | null | undefined): string {
  const input = String(value ?? "").trim();
  if (!input) return "";

  const hashIndex = input.indexOf("#");
  const urlAndQuery = hashIndex === -1 ? input : input.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : input.slice(hashIndex);
  const queryIndex = urlAndQuery.indexOf("?");

  if (queryIndex === -1) return input;

  const base = urlAndQuery.slice(0, queryIndex);
  const query = urlAndQuery.slice(queryIndex + 1);
  const keptParts: string[] = [];
  let removed = false;

  for (const part of query.split("&")) {
    const equalsIndex = part.indexOf("=");
    const rawKey = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    const rawValue = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
    const key = decodeQueryComponent(rawKey).toLowerCase();
    const paramValue = decodeQueryComponent(rawValue).toLowerCase();

    if (key === "utm_source" && paramValue === "chatgpt.com") {
      removed = true;
      continue;
    }

    keptParts.push(part);
  }

  if (!removed) return input;

  const remainingQuery = keptParts.join("&");
  return `${base}${remainingQuery ? `?${remainingQuery}` : ""}${hash}`;
}
