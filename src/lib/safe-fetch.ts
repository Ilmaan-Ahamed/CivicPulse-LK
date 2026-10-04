/**
 * Fetch wrapper that never throws a JSON.parse SyntaxError.
 * If the server returns non-JSON (HTML error page, empty body, etc.),
 * this surfaces a readable error instead of crashing on res.json().
 */
export async function safeFetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  let res: Response;

  try {
    res = await fetch(url, options);
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    // Server returned HTML (error page) or something else unexpected
    console.error(`Expected JSON from ${url}, got:`, contentType);
    return {
      ok: false,
      error: `Server error (status ${res.status}). Check the terminal for details.`,
    };
  }

  const data: unknown = await res.json();

  if (!res.ok) {
    const errorMessage =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`;
    return { ok: false, error: errorMessage };
  }

  return { ok: true, data: data as T };
}