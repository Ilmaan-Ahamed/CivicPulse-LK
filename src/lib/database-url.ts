export function normalizeDatabaseUrl(url?: string): string {
  const value = url?.trim();

  if (!value) {
    return "postgresql://postgres:postgres@localhost:5432/civicpulse?schema=public";
  }

  return value;
}
