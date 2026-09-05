export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export function normalizePaginated<T>(data: unknown): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return { results: data as T[], count: data.length, next: null, previous: null }
  }
  if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: unknown }).results)) {
    const obj = data as PaginatedResponse<T>
    return {
      count: typeof obj.count === 'number' ? obj.count : obj.results.length,
      next: obj.next || null,
      previous: obj.previous || null,
      results: obj.results || [],
    }
  }
  return { results: [], count: 0, next: null, previous: null }
}
