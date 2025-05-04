"use client";

import type { CreateGpxFileType, UpdateGpxFileType } from "@/features/api-types/media";
import { client } from "@/lib/hono-client";
import type { GpxFilesTypeSelect } from "@/server/db/schema";
import type { ApiResponse, PaginationMeta } from "@/types/api";

// Types for query parameters
export interface GpxFilesQueryParams {
  limit?: number;
  page?: number;
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
const convertParamsToQueryString = (params?: GpxFilesQueryParams): Record<string, string> => {
  if (!params) return {};

  const queryParams: Record<string, string> = {};

  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.page) queryParams.page = params.page.toString();

  return queryParams;
};

/**
 * Get GPX file by ID
 * @param id GPX file ID
 * @returns GPX file data
 */
export const getGpxFileById = async (id: string): Promise<GpxFilesTypeSelect> => {
  const response = await client.api.gpx[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch GPX file with ID ${id}`);
  }

  const result = (await response.json()) as ApiResponse<GpxFilesTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch GPX file with ID ${id}`);
  }

  return result.data;
};

/**
 * Get GPX file by media ID
 * @param mediaId Media ID
 * @returns GPX file data
 */
export const getGpxFileByMediaId = async (mediaId: string): Promise<GpxFilesTypeSelect> => {
  const response = await client.api.gpx.media[":mediaId"].$get({
    param: { mediaId },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch GPX file for media ${mediaId}`);
  }

  const result = (await response.json()) as ApiResponse<GpxFilesTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to fetch GPX file for media ${mediaId}`);
  }

  return result.data;
};

/**
 * Get GPX files by activity ID
 * @param activityId Activity ID
 * @param params Query parameters for pagination
 * @returns GPX files and pagination metadata
 */
export const getGpxFilesByActivityId = async (
  activityId: string,
  params?: GpxFilesQueryParams
): Promise<{ gpxFiles: GpxFilesTypeSelect[]; meta: PaginationMeta }> => {
  const queryParams = convertParamsToQueryString(params);

  const response = await client.api.gpx.activity[":activityId"].$get({
    param: { activityId },
    query: queryParams,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to fetch GPX files for activity ${activityId}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Failed to fetch GPX files for activity ${activityId}`);
  }

  return {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    gpxFiles: result.data.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    meta: createPaginationMeta(result.data, result.meta),
  };
};

/**
 * Create a new GPX file
 * @param data GPX file data to create
 * @returns Created GPX file
 */
export const createGpxFile = async (data: CreateGpxFileType): Promise<GpxFilesTypeSelect> => {
  const response = await client.api.gpx.$post({
    json: data,
  });

  if (!response.ok) {
    return handleApiError(response, "Failed to create GPX file");
  }

  const result = (await response.json()) as ApiResponse<GpxFilesTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || "Failed to create GPX file");
  }

  return result.data;
};

/**
 * Update a GPX file
 * @param id GPX file ID to update
 * @param data GPX file data to update
 * @returns Updated GPX file
 */
export const updateGpxFile = async (
  id: string,
  data: UpdateGpxFileType
): Promise<GpxFilesTypeSelect> => {
  const response = await client.api.gpx[":id"].$put({
    param: { id },
    json: data,
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to update GPX file with ID ${id}`);
  }

  const result = (await response.json()) as ApiResponse<GpxFilesTypeSelect>;

  if (!result.success) {
    throw new Error(result.message || `Failed to update GPX file with ID ${id}`);
  }

  return result.data;
};

/**
 * Delete a GPX file
 * @param id GPX file ID to delete
 * @returns Success status
 */
export const deleteGpxFile = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await client.api.gpx[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    return handleApiError(response, `Failed to delete GPX file with ID ${id}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || `Failed to delete GPX file with ID ${id}`);
  }

  return {
    success: true,
    message: result.message || "GPX file deleted successfully",
  };
};
