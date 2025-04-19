// Query keys for athletes - for consistent cache management
export const athleteKeys = {
  all: ["athletes"] as const,
  lists: () => [...athleteKeys.all, "list"] as const,
  list: (filters: string) => [...athleteKeys.lists(), { filters }] as const,
  details: () => [...athleteKeys.all, "detail"] as const,
  detail: (id: string) => [...athleteKeys.details(), id] as const,
  me: () => [...athleteKeys.all, "me"] as const,
  unique: (id: string) => [...athleteKeys.all, "unique", id] as const,
};
