const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

/**
 * pg-connection-string v2 treats prefer/require/verify-ca like verify-full but
 * warns until sslmode=verify-full is explicit (Neon and most hosted Postgres).
 */
export function normalizeDatabaseUrl(connectionString: string): string {
  try {
    const parsed = new URL(connectionString);
    const sslmode = parsed.searchParams.get("sslmode");
    if (sslmode && LEGACY_SSL_MODES.has(sslmode)) {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return connectionString;
  }
}
