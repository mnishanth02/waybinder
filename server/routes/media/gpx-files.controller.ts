import type { GpxFilesTypeInsert, GpxFilesTypeSelect, UserTypeSelect } from "@/server/db/schema";
import { ApiStatusCode } from "@/types/api";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { activities, gpxFiles, media } from "../../db/schema";

/**
 * @api {post} /media/gpx Create GPX File
 * @apiGroup GPX Files
 * @access Private
 */
export const createGpxFile = async (body: GpxFilesTypeInsert, userId: string) => {
  // Verify that the media exists and is of type 'gpx'
  const mediaItem = await db.query.media.findFirst({
    where: eq(media.id, body.mediaId),
  });

  if (!mediaItem) {
    return {
      success: false,
      message: "Media not found",
      error: "No media found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  if (mediaItem.mediaType !== "gpx") {
    return {
      success: false,
      message: "Invalid media type",
      error: "The provided media must be of type 'gpx'",
      statusCode: ApiStatusCode.BAD_REQUEST,
    };
  }

  // Verify that the uploader is the current user
  if (mediaItem.uploaderId !== userId) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to create a GPX file for this media",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Verify that the activity exists
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, body.activityId),
  });

  if (!activity) {
    return {
      success: false,
      message: "Activity not found",
      error: "No activity found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Create the GPX file
  const result = await db.insert(gpxFiles).values(body).returning();
  const createdGpxFile = result[0];

  if (!createdGpxFile) {
    return {
      success: false,
      message: "Failed to create GPX file",
      error: "An error occurred while creating the GPX file",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    success: true,
    message: "GPX file created successfully",
    data: createdGpxFile,
  };
};

/**
 * @api {get} /media/gpx/:id Get GPX File by ID
 * @apiGroup GPX Files
 * @access Public
 */
export const getGpxFileById = async (id: string) => {
  const gpxFile = await db.query.gpxFiles.findFirst({
    where: eq(gpxFiles.id, id),
    with: {
      media: {
        with: {
          uploader: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      activity: {
        columns: {
          id: true,
          title: true,
          activityUniqueId: true,
          activityType: true,
        },
      },
    },
  });

  if (!gpxFile) {
    return {
      success: false,
      message: "GPX file not found",
      error: "No GPX file found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  return {
    success: true,
    data: gpxFile,
  };
};

/**
 * @api {get} /media/gpx/activity/:activityId Get GPX Files by Activity ID
 * @apiGroup GPX Files
 * @access Public
 */
export const getGpxFilesByActivityId = async (
  activityId: string,
  params: {
    limit: number;
    page: number;
  }
) => {
  const { limit, page } = params;
  const offset = (page - 1) * limit;

  // Build the where clause
  const whereClause = eq(gpxFiles.activityId, activityId);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(gpxFiles)
    .where(whereClause)
    .then((result) => Number(result[0]?.count || 0));

  const totalCount = Number(countResult);
  const totalPages = Math.ceil(totalCount / limit);

  // Get GPX files with pagination
  const gpxFilesList = await db.query.gpxFiles.findMany({
    where: whereClause,
    orderBy: [gpxFiles.createdAt],
    limit,
    offset,
    with: {
      media: {
        columns: {
          id: true,
          url: true,
          filename: true,
          mediaType: true,
        },
      },
    },
  });

  return {
    success: true,
    data: gpxFilesList,
    meta: {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    },
  };
};

/**
 * @api {get} /media/gpx/media/:mediaId Get GPX File by Media ID
 * @apiGroup GPX Files
 * @access Public
 */
export const getGpxFileByMediaId = async (mediaId: string) => {
  const gpxFile = await db.query.gpxFiles.findFirst({
    where: eq(gpxFiles.mediaId, mediaId),
    with: {
      activity: {
        columns: {
          id: true,
          title: true,
          activityUniqueId: true,
          activityType: true,
        },
      },
    },
  });

  if (!gpxFile) {
    return {
      success: false,
      message: "GPX file not found",
      error: "No GPX file found with the provided media ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  return {
    success: true,
    data: gpxFile,
  };
};

/**
 * @api {put} /media/gpx/:id Update GPX File
 * @apiGroup GPX Files
 * @access Private
 */
export const updateGpxFile = async (
  id: string,
  updateData: Partial<GpxFilesTypeSelect>,
  user: UserTypeSelect
) => {
  // Find the GPX file to verify ownership
  const gpxFile = await db.query.gpxFiles.findFirst({
    where: eq(gpxFiles.id, id),
    with: {
      media: true,
    },
  });

  if (!gpxFile) {
    return {
      success: false,
      message: "GPX file not found",
      error: "No GPX file found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only update their own GPX files unless they're an admin
  if (gpxFile.media.uploaderId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to update this GPX file",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Update GPX file
  const result = await db.update(gpxFiles).set(updateData).where(eq(gpxFiles.id, id)).returning();
  const updatedGpxFile = result[0];

  return {
    success: true,
    message: "GPX file updated successfully",
    data: updatedGpxFile,
  };
};

/**
 * @api {delete} /media/gpx/:id Delete GPX File
 * @apiGroup GPX Files
 * @access Private
 */
export const deleteGpxFile = async (id: string, user: UserTypeSelect) => {
  // Find the GPX file to verify ownership
  const gpxFile = await db.query.gpxFiles.findFirst({
    where: eq(gpxFiles.id, id),
    with: {
      media: true,
    },
  });

  if (!gpxFile) {
    return {
      success: false,
      message: "GPX file not found",
      error: "No GPX file found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only delete their own GPX files unless they're an admin
  if (gpxFile.media.uploaderId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to delete this GPX file",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Delete GPX file
  await db.delete(gpxFiles).where(eq(gpxFiles.id, id));

  return {
    success: true,
    message: "GPX file deleted successfully",
    data: { id },
  };
};
