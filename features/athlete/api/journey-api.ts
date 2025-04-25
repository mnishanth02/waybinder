import type { CreateJourneyType, UpdateJourneyType } from "@/features/api-types/journey";
import { client } from "@/lib/hono-client";
import type { JourneyTypeSelect } from "@/server/db/schema";
import type { ApiResponse, PaginationMeta } from "@/types/api";

// Define a type for journey query parameters
interface JourneyQueryParams {
  limit?: number;
  page?: number;
  journeyType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Helper function to convert params to query string parameters
const convertParamsToQueryString = (params?: JourneyQueryParams): Record<string, string> => {
  const queryParams: Record<string, string> = {};

  if (params) {
    if (params.limit !== undefined) queryParams.limit = params.limit.toString();
    if (params.page !== undefined) queryParams.page = params.page.toString();
    if (params.journeyType) queryParams.journeyType = params.journeyType;
    if (params.search) queryParams.search = params.search;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
  }

  return queryParams;
};

// Helper function to handle API errors
const handleApiError = async (response: Response, defaultMessage: string): Promise<never> => {
  const errorData = await response.json().catch(() => null);
  throw new Error(errorData ? JSON.stringify(errorData) : defaultMessage);
};

// Helper function to transform journey dates
// biome-ignore lint/suspicious/noExplicitAny: Needs to handle unknown API response structure
const transformJourneyDates = (journeys: any[]): JourneyTypeSelect[] => {
  return journeys.map((journey) => ({
    ...journey,
    startDate: new Date(journey.startDate),
    endDate: new Date(journey.endDate),
    createdAt: new Date(journey.createdAt),
    updatedAt: new Date(journey.updatedAt),
    publishedAt: journey.publishedAt ? new Date(journey.publishedAt) : null,
  }));
};

// Helper function to create pagination metadata
// biome-ignore lint/suspicious/noExplicitAny: Needs to handle unknown API response structure
const createPaginationMeta = (data: any[], meta?: PaginationMeta): PaginationMeta => {
  return (
    meta || {
      total: data.length,
      page: 1,
      limit: data.length,
      pages: 1,
    }
  );
};

// Export journey data type for use in hooks
/**
 * Create a new journey
 */
export const createJourney = async (data: CreateJourneyType): Promise<JourneyTypeSelect> => {
  const response = await client.api.journey.$post({
    json: data,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to create journey");
  }

  const result = (await response.json()) as ApiResponse<JourneyTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || "Failed to create journey");
  }

  return result.data;

  // Return the created journey data with the information we have
};

/**
 * Get all journeys with optional filtering and pagination
 */
export const getJourneys = async (
  params?: JourneyQueryParams
): Promise<{ journeys: JourneyTypeSelect[]; meta: PaginationMeta }> => {
  // Use helper function to convert params to query string
  const queryParams = convertParamsToQueryString(params);

  const response = await client.api.journey.$get({
    query: queryParams,
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch journeys");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error("Failed to fetch journeys");
  }

  // Transform journey dates
  const journeyData = transformJourneyDates(result.data);

  return {
    journeys: journeyData,
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Get journey by ID
 */
export const getJourneyById = async (id: string): Promise<JourneyTypeSelect> => {
  const response = await client.api.journey[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : `Failed to fetch journey with ID ${id}`
    );
  }

  const result = (await response.json()) as ApiResponse<JourneyTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch journey with ID ${id}`);
  }

  return result.data;
};

/**
 * Get journey by unique ID
 */
export const getJourneyByUniqueId = async (uniqueId: string): Promise<JourneyTypeSelect> => {
  const response = await client.api.journey.unique[":id"].$get({
    param: { id: uniqueId },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : `Failed to fetch journey with unique ID ${uniqueId}`
    );
  }

  const result = (await response.json()) as ApiResponse<JourneyTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch journey with unique ID ${uniqueId}`);
  }

  return result.data;
};

/**
 * Get journey by slug
 */
export const getJourneyBySlug = async (slug: string): Promise<JourneyTypeSelect> => {
  const response = await client.api.journey.slug[":slug"].$get({
    param: { slug },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : `Failed to fetch journey with slug ${slug}`
    );
  }

  const result = (await response.json()) as ApiResponse<JourneyTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch journey with slug ${slug}`);
  }

  return result.data;
};

/**
 * Get current user's journeys
 */
export const getMyJourneys = async (
  params?: JourneyQueryParams
): Promise<{ journeys: JourneyTypeSelect[]; meta: PaginationMeta }> => {
  // Use helper function to convert params to query string
  const queryParams = convertParamsToQueryString(params);

  const response = await client.api.journey.me.$get({
    query: queryParams,
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch my journeys");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error("Failed to fetch my journeys");
  }

  // Transform journey dates
  const journeyData = transformJourneyDates(result.data);

  return {
    journeys: journeyData,
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Update a journey
 */
export const updateJourney = async (
  id: string,
  data: UpdateJourneyType
): Promise<JourneyTypeSelect> => {
  const response = await client.api.journey[":id"].$put({
    param: { id },
    json: data,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : `Failed to update journey with ID ${id}`
    );
  }

  const result = (await response.json()) as ApiResponse<JourneyTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to update journey with ID ${id}`);
  }

  return result.data;
};

/**
 * Delete a journey
 */
export const deleteJourney = async (id: string): Promise<{ id: string }> => {
  const response = await client.api.journey[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : `Failed to delete journey with ID ${id}`
    );
  }

  const result = (await response.json()) as ApiResponse<{ id: string }>;

  if (!result.success) {
    throw new Error(result.message || `Failed to delete journey with ID ${id}`);
  }

  return result.data;
};
