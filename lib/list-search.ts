/** Client-side filter: true when query is empty or any value contains the query (case-insensitive). */
export function matchesListSearch(
  query: string,
  values: (string | number | null | undefined)[],
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return values.some((v) => String(v ?? "").toLowerCase().includes(q))
}
