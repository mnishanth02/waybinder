import {
  type MediaTypeInsert,
  type MediaTypeSelect,
  type UserTypeSelect,
  activities,
  journeys,
  media,
} from "@/server/db/schema";
import { ApiStatusCode } from "@/types/api";
import { MEDIA_TYPES, type MediaType } from "@/types/enums";
import { type SQL, and, eq, sql } from "drizzle-orm";
import { db } from "../../db";

/**
 * @api {post} /media Create Media
 * @apiGroup Media
 * @access Private
 */
export const createMedia = async (body: MediaTypeInsert, userId: string) => {
  // Verify that the parent (journey or activity) exists
  if (body.journeyId) {
    const journey = await db.query.journeys.findFirst({
      where: eq(journeys.id, body.journeyId),
    });

    if (!journey) {
      return {
        success: false,
        message: "Journey not found",
        error: "No journey found with the provided ID",
        statusCode: ApiStatusCode.NOT_FOUND,
      };
    }
  } else if (body.activityId) {
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
  } else {
    return {
      success: false,
      message: "Invalid parent",
      error: "Either journeyId or activityId must be provided",
      statusCode: ApiStatusCode.BAD_REQUEST,
    };
  }

  // Create the media with the user as uploader
  const newMedia: MediaTypeInsert = {
    ...body,
    uploaderId: userId,
  };

  // Insert the media into the database
  const result = await db.insert(media).values(newMedia).returning();
  const createdMedia = result[0];

  if (!createdMedia) {
    return {
      success: false,
      message: "Failed to create media",
      error: "An error occurred while creating the media",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    success: true,
    message: "Media created successfully",
    data: createdMedia,
  };
};

/**
 * @api {get} /media/:id Get Media by ID
 * @apiGroup Media
 * @access Public
 */
export const getMediaById = async (id: string) => {
  const mediaItem = await db.query.media.findFirst({
    where: eq(media.id, id),
    with: {
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      journey: true,
      activity: true,
      gpxFile: true,
    },
  });

  if (!mediaItem) {
    return {
      success: false,
      message: "Media not found",
      error: "No media found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  return {
    success: true,
    data: mediaItem,
  };
};

/**
 * @api {get} /media/journey/:journeyId Get Media by Journey ID
 * @apiGroup Media
 * @access Public
 */
export const getMediaByJourneyId = async (
  journeyId: string,
  params: {
    limit: number;
    page: number;
    mediaType?: string;
  }
) => {
  const { limit, page, mediaType } = params;
  const offset = (page - 1) * limit;

  // Build the where clause
  const conditions: SQL<unknown>[] = [eq(media.journeyId, journeyId)];

  if (mediaType && MEDIA_TYPES.includes(mediaType as MediaType)) {
    conditions.push(eq(media.mediaType, mediaType as MediaType));
  }

  const whereClause = and(...conditions);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .where(whereClause)
    .then((result) => Number(result[0]?.count || 0));

  const totalCount = Number(countResult);
  const totalPages = Math.ceil(totalCount / limit);

  // Get media with pagination
  const mediaList = await db.query.media.findMany({
    where: whereClause,
    orderBy: [media.order, media.createdAt],
    limit,
    offset,
    with: {
      uploader: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    success: true,
    data: mediaList,
    meta: {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    },
  };
};

/**
 * @api {get} /media/activity/:activityId Get Media by Activity ID
 * @apiGroup Media
 * @access Public
 */
export const getMediaByActivityId = async (
  activityId: string,
  params: {
    limit: number;
    page: number;
    mediaType?: string;
  }
) => {
  const { limit, page, mediaType } = params;
  const offset = (page - 1) * limit;

  // Build the where clause
  const conditions: SQL<unknown>[] = [eq(media.activityId, activityId)];

  if (mediaType && MEDIA_TYPES.includes(mediaType as MediaType)) {
    conditions.push(eq(media.mediaType, mediaType as MediaType));
  }

  const whereClause = and(...conditions);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .where(whereClause)
    .then((result) => Number(result[0]?.count || 0));

  const totalCount = Number(countResult);
  const totalPages = Math.ceil(totalCount / limit);

  // Get media with pagination
  const mediaList = await db.query.media.findMany({
    where: whereClause,
    orderBy: [media.order, media.createdAt],
    limit,
    offset,
    with: {
      uploader: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    success: true,
    data: mediaList,
    meta: {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    },
  };
};

/**
 * @api {get} /media/user/:userId Get Media by User ID
 * @apiGroup Media
 * @access Public
 */
export const getMediaByUserId = async (
  userId: string,
  params: {
    limit: number;
    page: number;
    mediaType?: string;
  }
) => {
  const { limit, page, mediaType } = params;
  const offset = (page - 1) * limit;

  // Build the where clause
  const conditions: SQL<unknown>[] = [eq(media.uploaderId, userId)];

  if (mediaType && MEDIA_TYPES.includes(mediaType as MediaType)) {
    conditions.push(eq(media.mediaType, mediaType as MediaType));
  }

  const whereClause = and(...conditions);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .where(whereClause)
    .then((result) => Number(result[0]?.count || 0));

  const totalCount = Number(countResult);
  const totalPages = Math.ceil(totalCount / limit);

  // Get media with pagination
  const mediaList = await db.query.media.findMany({
    where: whereClause,
    orderBy: [media.createdAt],
    limit,
    offset,
    with: {
      journey: {
        columns: {
          id: true,
          title: true,
          journeyUniqueId: true,
          slug: true,
        },
      },
      activity: {
        columns: {
          id: true,
          title: true,
          activityUniqueId: true,
        },
      },
    },
  });

  return {
    success: true,
    data: mediaList,
    meta: {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    },
  };
};

/**
 * @api {put} /media/:id Update Media
 * @apiGroup Media
 * @access Private
 */
export const updateMedia = async (
  id: string,
  updateData: Partial<MediaTypeSelect>,
  user: UserTypeSelect
) => {
  // Find the media to verify ownership
  const mediaItem = await db.query.media.findFirst({
    where: eq(media.id, id),
  });

  if (!mediaItem) {
    return {
      success: false,
      message: "Media not found",
      error: "No media found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only update their own media unless they're an admin
  if (mediaItem.uploaderId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to update this media",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Update media
  const result = await db.update(media).set(updateData).where(eq(media.id, id)).returning();
  const updatedMedia = result[0];

  return {
    success: true,
    message: "Media updated successfully",
    data: updatedMedia,
  };
};

/**
 * @api {delete} /media/:id Delete Media
 * @apiGroup Media
 * @access Private
 */
export const deleteMedia = async (id: string, user: UserTypeSelect) => {
  // Find the media to verify ownership
  const mediaItem = await db.query.media.findFirst({
    where: eq(media.id, id),
  });

  if (!mediaItem) {
    return {
      success: false,
      message: "Media not found",
      error: "No media found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only delete their own media unless they're an admin
  if (mediaItem.uploaderId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to delete this media",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Delete media (cascade will handle related gpx_files)
  await db.delete(media).where(eq(media.id, id));

  return {
    success: true,
    message: "Media deleted successfully",
    data: { id },
  };
};
