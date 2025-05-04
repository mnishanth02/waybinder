"use client";

import type { CreateMediaType, UpdateMediaType } from "@/features/api-types/media";
import { client } from "@/lib/hono-client";
import type { MediaTypeSelect } from "@/server/db/schema";
import type { ApiResponse, PaginationMeta } from "@/types/api";

// Types for query parameters
export interface MediaQueryParams {
  limit?: number;
  page?: number;
  mediaType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

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

// Helper function to convert params to query string
const convertParamsToQueryString = (params?: MediaQueryParams): Record<string, string> => {
  if (!params) return {};

  const queryParams: Record<string, string> = {};

  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.page) queryParams.page = params.page.toString();
  if (params.mediaType) queryParams.mediaType = params.mediaType;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

  return queryParams;
};

/**
 * Get media by ID
 * @param id Media ID
 * @returns Media data
 */
export const getMediaById = async (id: string): Promise<MediaTypeSelect> => {
  const response = await client.api.media[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch media with ID ${id}`);
  }

  const result = (await response.json()) as ApiResponse<MediaTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch media with ID ${id}`);
  }

  return result.data;
};

/**
 * Get media by journey ID
 * @param journeyId Journey ID
 * @param params Query parameters for filtering and pagination
 * @returns Media items and pagination metadata
 */
export const getMediaByJourneyId = async (
  journeyId: string,
  params?: MediaQueryParams
): Promise<{ media: MediaTypeSelect[]; meta: PaginationMeta }> => {
  const queryParams = convertParamsToQueryString(params);

  const response = await client.api.media.journey[":journeyId"].$get({
    param: { journeyId },
    query: queryParams,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch media for journey ${journeyId}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Failed to fetch media for journey ${journeyId}`);
  }

  return {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    media: result.data.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Get media by activity ID
 * @param activityId Activity ID
 * @param params Query parameters for filtering and pagination
 * @returns Media items and pagination metadata
 */
export const getMediaByActivityId = async (
  activityId: string,
  params?: MediaQueryParams
): Promise<{ media: MediaTypeSelect[]; meta: PaginationMeta }> => {
  const queryParams = convertParamsToQueryString(params);

  const response = await client.api.media.activity[":activityId"].$get({
    param: { activityId },
    query: queryParams,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch media for activity ${activityId}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Failed to fetch media for activity ${activityId}`);
  }

  return {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    media: result.data.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Get media by user ID
 * @param userId User ID
 * @param params Query parameters for filtering and pagination
 * @returns Media items and pagination metadata
 */
export const getMediaByUserId = async (
  userId: string,
  params?: MediaQueryParams
): Promise<{ media: MediaTypeSelect[]; meta: PaginationMeta }> => {
  const queryParams = convertParamsToQueryString(params);

  const response = await client.api.media.user[":userId"].$get({
    param: { userId },
    query: queryParams,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch media for user ${userId}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Failed to fetch media for user ${userId}`);
  }

  return {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    media: result.data.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Create a new media item
 * @param data Media data to create
 * @returns Created media item
 */
export const createMedia = async (data: CreateMediaType): Promise<MediaTypeSelect> => {
  const response = await client.api.media.$post({
    json: data,
  });

  if (!response.ok) {
    return handleApiError(response, "Failed to create media");
  }

  const result = (await response.json()) as ApiResponse<MediaTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || "Failed to create media");
  }

  return result.data;
};

/**
 * Update a media item
 * @param id Media ID to update
 * @param data Media data to update
 * @returns Updated media item
 */
export const updateMedia = async (id: string, data: UpdateMediaType): Promise<MediaTypeSelect> => {
  const response = await client.api.media[":id"].$put({
    param: { id },
    json: data,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to update media with ID ${id}`);
  }

  const result = (await response.json()) as ApiResponse<MediaTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to update media with ID ${id}`);
  }

  return result.data;
};

/**
 * Delete a media item
 * @param id Media ID to delete
 * @returns Success status
 */
export const deleteMedia = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await client.api.media[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to delete media with ID ${id}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || `Failed to delete media with ID ${id}`);
  }

  return {
    success: true,
    message: result.message || "Media deleted successfully",
  };
};
