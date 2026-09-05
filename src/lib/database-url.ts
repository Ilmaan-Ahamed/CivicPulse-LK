export function normalizeDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file (Neon connection string)."
    );
  }

  // Ensure sslmode=require is present for Neon connections
  if (!url.includes("sslmode=")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}sslmode=require`;
  }

  return url;
}