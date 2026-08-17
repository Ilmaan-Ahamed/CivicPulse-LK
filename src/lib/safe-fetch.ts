/**
 * Fetch wrapper that never throws a JSON.parse SyntaxError.
 * If the server returns non-JSON (HTML error page, empty body, etc.),
 * this surfaces a readable error instead of crashing on res.json().
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  let res: Response;

  try {
    res = await fetch(url, options);
  } catch (networkError) {
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

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data.error || `Request failed (${res.status})` };
  }

  return { ok: true, data };
}