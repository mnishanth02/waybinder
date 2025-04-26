import { nanoid } from "nanoid";

/**
 * Generate a slug from a title
 * @param title The title to generate a slug from
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string): string {
  // Convert to lowercase and replace spaces with hyphens
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens

  // Add a short random string to ensure uniqueness
  return `${baseSlug}-${nanoid(6)}`;
}

/**
 * Generate a unique ID for a journey
 * @param title The title of the journey (optional)
 * @returns A unique ID
 */
export function generateJourneyUniqueId(title?: string): string {
  const prefix = title ? title.substring(0, 10).toLowerCase().replace(/[^\w]/g, "_") : "journey";

  return `${prefix}_${nanoid(10)}`;
}

/**
 * Generate a unique ID for an activity
 * @param title The title of the activity (optional)
 * @returns A unique ID
 */
export function generateActivityUniqueId(title?: string): string {
  const prefix = title ? title.substring(0, 10).toLowerCase().replace(/[^\w]/g, "_") : "activity";

  return `${prefix}_${nanoid(10)}`;
}
