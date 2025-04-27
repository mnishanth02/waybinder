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

// Query keys for activities - for consistent cache management
export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (filters: unknown) => [...activityKeys.lists(), { filters }] as const,
  details: () => [...activityKeys.all, "detail"] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
  byJourney: (journeyId: string, options?: unknown) =>
    [...activityKeys.all, "journey", journeyId, options ? { options } : {}] as const,
  byUniqueId: (uniqueId: string) => [...activityKeys.all, "unique", uniqueId] as const,
  journey: (journeyId: string) => [...activityKeys.all, "journey", journeyId] as const,
  unique: (id: string) => [...activityKeys.all, "unique", id] as const,
};
