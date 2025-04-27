import type { CreateActivityType, UpdateActivityType } from "@/features/api-types/activity";
import { client } from "@/lib/hono-client";
import type { ActivityTypeSelect } from "@/server/db/schema";
import type { ApiResponse, PaginationMeta } from "@/types/api";

// Define a type for activity query parameters
interface ActivityQueryParams {
  limit?: number;
  page?: number;
  journeyId?: string;
  activityType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Helper function to convert params to query string parameters
const convertParamsToQueryString = (params?: ActivityQueryParams): Record<string, string> => {
  const queryParams: Record<string, string> = {};

  if (params) {
    if (params.limit !== undefined) queryParams.limit = params.limit.toString();
    if (params.page !== undefined) queryParams.page = params.page.toString();
    if (params.journeyId) queryParams.journeyId = params.journeyId;
    if (params.activityType) queryParams.activityType = params.activityType;
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

// Helper function to create pagination metadata
const createPaginationMeta = (
  data: unknown[],
  meta?: { total?: number; page?: number; limit?: number; pages?: number }
): PaginationMeta => {
  return {
    total: meta?.total ?? data.length,
    page: meta?.page ?? 1,
    limit: meta?.limit ?? data.length,
    pages: meta?.pages ?? 1,
  };
};

// Helper function to transform activity dates
const transformActivityDates = (activities: Record<string, unknown>[]): ActivityTypeSelect[] => {
  return activities.map((activity) => ({
    ...activity,
    startTime: activity.startTime ? new Date(activity.startTime as string) : null,
    endTime: activity.endTime ? new Date(activity.endTime as string) : null,
    createdAt: new Date(activity.createdAt as string),
    updatedAt: new Date(activity.updatedAt as string),
  })) as ActivityTypeSelect[];
};

/**
 * Create a new activity
 * @param data Activity data to create
 * @returns Created activity data
 */
export const createActivity = async (data: CreateActivityType): Promise<ActivityTypeSelect> => {
  const response = await client.api.activity.$post({
    json: data,
  });

  if (!response.ok) {
    return handleApiError(response, "Failed to create activity");
  }

  const result = (await response.json()) as ApiResponse<ActivityTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || "Failed to create activity");
  }

  return result.data;
};

/**
 * Get all activities with optional filtering and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Activities and pagination metadata
 */
export const getActivities = async (
  params?: ActivityQueryParams
): Promise<{ activities: ActivityTypeSelect[]; meta: PaginationMeta }> => {
  // Use helper function to convert params to query string
  const queryParams = convertParamsToQueryString(params);

  const response = await client.api.activity.$get({
    query: queryParams,
  });

  if (!response.ok) {
    return handleApiError(response, "Failed to fetch activities");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch activities");
  }

  // Transform activity dates
  const activityData = transformActivityDates(result.data);

  return {
    activities: activityData,
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Get activities by journey ID
 * @param journeyId Journey unique ID
 * @param params Query parameters for filtering and pagination
 * @returns Activities and pagination metadata
 */
export const getActivitiesByJourneyId = async (
  journeyId: string,
  params?: Omit<ActivityQueryParams, "journeyId">
): Promise<{ activities: ActivityTypeSelect[]; meta: PaginationMeta }> => {
  // Use helper function to convert params to query string
  const queryParams = convertParamsToQueryString({ ...params, journeyId });

  const response = await client.api.activity.journey[":journeyId"].$get({
    param: { journeyId },
    query: queryParams,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch activities for journey ${journeyId}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch activities for journey ${journeyId}`);
  }

  // Transform activity dates
  const activityData = transformActivityDates(result.data);

  return {
    activities: activityData,
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Get activity by ID
 * @param id Activity ID
 * @returns Activity data
 */
export const getActivityById = async (id: string): Promise<ActivityTypeSelect> => {
  const response = await client.api.activity[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch activity with ID ${id}`);
  }

  const result = (await response.json()) as ApiResponse<ActivityTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch activity with ID ${id}`);
  }

  return result.data;
};

/**
 * Get activity by unique ID
 * @param uniqueId Activity unique ID
 * @returns Activity data
 */
export const getActivityByUniqueId = async (uniqueId: string): Promise<ActivityTypeSelect> => {
  const response = await client.api.activity.unique[":id"].$get({
    param: { id: uniqueId },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch activity with unique ID ${uniqueId}`);
  }

  const result = (await response.json()) as ApiResponse<ActivityTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch activity with unique ID ${uniqueId}`);
  }

  return result.data;
};

/**
 * Update an activity
 * @param id Activity ID
 * @param data Activity data to update
 * @returns Updated activity data
 */
export const updateActivity = async (
  id: string,
  data: UpdateActivityType
): Promise<ActivityTypeSelect> => {
  const response = await client.api.activity[":id"].$put({
    param: { id },
    json: data,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to update activity with ID ${id}`);
  }

  const result = (await response.json()) as ApiResponse<ActivityTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to update activity with ID ${id}`);
  }

  return result.data;
};

/**
 * Delete an activity
 * @param id Activity ID
 * @returns Deleted activity ID
 */
export const deleteActivity = async (id: string): Promise<{ id: string }> => {
  const response = await client.api.activity[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to delete activity with ID ${id}`);
  }

  const result = (await response.json()) as ApiResponse<{ id: string }>;

  if (!result.success) {
    throw new Error(result.message || `Failed to delete activity with ID ${id}`);
  }

  return { id };
};
