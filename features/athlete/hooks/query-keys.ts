// Query keys for journeys - for consistent cache management
export const journeyKeys = {
  all: ["journeys"] as const,
  lists: () => [...journeyKeys.all, "list"] as const,
  list: (filters: unknown) => [...journeyKeys.lists(), { filters }] as const,
  details: () => [...journeyKeys.all, "detail"] as const,
  detail: (id: string) => [...journeyKeys.details(), id] as const,
  me: () => [...journeyKeys.all, "me"] as const,
  unique: (id: string) => [...journeyKeys.all, "unique", id] as const,
  slug: (slug: string) => [...journeyKeys.all, "slug", slug] as const,
};
