// Query keys for media - for consistent cache management
export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: unknown) => [...mediaKeys.lists(), { filters }] as const,
  details: () => [...mediaKeys.all, "detail"] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
  byJourney: (journeyId: string, options?: unknown) =>
    [...mediaKeys.all, "journey", journeyId, options ? { options } : {}] as const,
  byActivity: (activityId: string, options?: unknown) =>
    [...mediaKeys.all, "activity", activityId, options ? { options } : {}] as const,
  byUser: (userId: string, options?: unknown) =>
    [...mediaKeys.all, "user", userId, options ? { options } : {}] as const,
};

// Query keys for GPX files - for consistent cache management
export const gpxFileKeys = {
  all: ["gpxFiles"] as const,
  lists: () => [...gpxFileKeys.all, "list"] as const,
  list: (filters: unknown) => [...gpxFileKeys.lists(), { filters }] as const,
  details: () => [...gpxFileKeys.all, "detail"] as const,
  detail: (id: string) => [...gpxFileKeys.details(), id] as const,
  byMedia: (mediaId: string) => [...gpxFileKeys.all, "media", mediaId] as const,
  byActivity: (activityId: string, options?: unknown) =>
    [...gpxFileKeys.all, "activity", activityId, options ? { options } : {}] as const,
};
