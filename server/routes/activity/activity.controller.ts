import { generateActivityUniqueId } from "@/lib/utils/slug";
import { db } from "@/server/db";
import type { ActivityTypeInsert, UserTypeSelect } from "@/server/db/schema";
import { activities, journeys } from "@/server/db/schema";
import { ApiStatusCode } from "@/types/api";
import { ACTIVITY_TYPES, type ActivityType } from "@/types/enums";
import { type SQL, and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

/**
 * @api {post} /activities Create Activity
 * @apiGroup Activities
 * @access Private
 */
export const createActivity = async (
  body: Omit<ActivityTypeInsert, "activityUniqueId">,
  userId: string
) => {
  // Verify that the journey exists and the user has access to it
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

  // Ensure user can only add activities to their own journeys unless they're an admin
  if (journey.creatorId !== userId) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to add activities to this journey",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Generate a unique ID for the activity
  const activityUniqueId = generateActivityUniqueId(body.title);

  // Create the activity with the generated values
  const newActivity: ActivityTypeInsert = {
    ...body,
    activityUniqueId,
  };

  // Insert the activity into the database
  const result = await db.insert(activities).values(newActivity).returning();

  if (!result.length) {
    return {
      success: false,
      message: "Failed to create activity",
      error: "Database operation failed",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }

  // We've already checked that result has at least one element
  const createdActivity = result[0];

  if (!createdActivity) {
    return {
      success: false,
      message: "Failed to create activity",
      error: "Database operation returned an empty result",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    success: true,
    message: "Activity created successfully",
    data: {
      id: createdActivity.id,
      activityUniqueId: createdActivity.activityUniqueId,
    },
  };
};

/**
 * @api {get} /activities Get All Activities
 * @apiGroup Activities
 * @access Public
 */
export const getActivities = async (params: {
  limit: number;
  page: number;
  journeyId?: string;
  activityType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const {
    limit,
    page,
    journeyId,
    activityType,
    search,
    sortBy = "activityDate",
    sortOrder = "asc",
  } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build the where clause
  let whereClause: SQL<unknown> | undefined = undefined;

  if (journeyId) {
    const journeyCondition = eq(activities.journeyId, journeyId);
    whereClause = whereClause ? and(whereClause, journeyCondition) : journeyCondition;
  }

  if (activityType) {
    // Cast to the correct type for the enum
    // Using a type assertion here because we know the activityType is valid
    const validActivityType = ACTIVITY_TYPES.includes(activityType as ActivityType)
      ? (activityType as ActivityType)
      : "other";
    const typeCondition = eq(activities.activityType, validActivityType);
    whereClause = whereClause ? and(whereClause, typeCondition) : typeCondition;
  }

  if (search) {
    const searchCondition = or(
      ilike(activities.title, `%${search}%`),
      ilike(activities.content || "", `%${search}%`)
    );
    whereClause = whereClause ? and(whereClause, searchCondition) : searchCondition;
  }

  // Determine the field to sort by
  const orderByField = (() => {
    switch (sortBy) {
      case "title":
        return activities.title;
      case "activityType":
        return activities.activityType;
      case "createdAt":
        return activities.createdAt;
      default:
        return activities.activityDate;
    }
  })();

  const orderByDirection = sortOrder === "asc" ? asc(orderByField) : desc(orderByField);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(activities)
    .where(whereClause)
    .then((result) => result[0]?.count || 0);

  const totalCount = Number(countResult);
  const totalPages = Math.ceil(totalCount / limit);

  // Get activities with pagination and sorting
  const activityList = await db.query.activities.findMany({
    where: whereClause,
    orderBy: [orderByDirection],
    limit,
    offset,
    with: {
      journey: {
        columns: {
          id: true,
          title: true,
          journeyUniqueId: true,
        },
      },
    },
  });

  return {
    success: true,
    data: activityList,
    meta: {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    },
  };
};

/**
 * @api {get} /activities/journey/:journeyId Get Activities by Journey ID
 * @apiGroup Activities
 * @access Public
 */
export const getActivitiesByJourneyId = async (
  journeyId: string,
  params: {
    limit: number;
    page: number;
    activityType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) => {
  return getActivities({
    ...params,
    journeyId,
  });
};

/**
 * @api {get} /activities/:id Get Activity by ID
 * @apiGroup Activities
 * @access Public
 */
export const getActivityById = async (id: string) => {
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, id),
    with: {
      journey: {
        columns: {
          id: true,
          title: true,
          journeyUniqueId: true,
        },
      },
    },
  });

  if (!activity) {
    return {
      success: false,
      message: "Activity not found",
      error: "No activity found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  return {
    success: true,
    data: activity,
  };
};

/**
 * @api {get} /activities/unique/:id Get Activity by Unique ID
 * @apiGroup Activities
 * @access Public
 */
export const getActivityByUniqueId = async (id: string) => {
  const activity = await db.query.activities.findFirst({
    where: eq(activities.activityUniqueId, id),
    with: {
      journey: {
        columns: {
          id: true,
          title: true,
          journeyUniqueId: true,
        },
      },
    },
  });

  if (!activity) {
    return {
      success: false,
      message: "Activity not found",
      error: "No activity found with the provided unique ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  return {
    success: true,
    data: activity,
  };
};

/**
 * @api {put} /activities/:id Update Activity
 * @apiGroup Activities
 * @access Private
 */
export const updateActivity = async (
  id: string,
  updateData: Partial<ActivityTypeInsert>,
  user: UserTypeSelect
) => {
  // Find the activity to verify ownership
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, id),
    with: {
      journey: true,
    },
  });

  if (!activity) {
    return {
      success: false,
      message: "Activity not found",
      error: "No activity found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only update activities in their own journeys unless they're an admin
  if (activity.journey.creatorId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to update this activity",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Update activity with the updatedAt timestamp
  const result = await db
    .update(activities)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, id))
    .returning();

  const updatedActivity = result[0];

  if (!updatedActivity) {
    return {
      success: false,
      message: "Failed to update activity",
      error: "Database operation returned an empty result",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    success: true,
    message: "Activity updated successfully",
    data: updatedActivity,
  };
};

/**
 * @api {delete} /activities/:id Delete Activity
 * @apiGroup Activities
 * @access Private
 */
export const deleteActivity = async (id: string, user: UserTypeSelect) => {
  // Find the activity to verify ownership
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, id),
    with: {
      journey: true,
    },
  });

  if (!activity) {
    return {
      success: false,
      message: "Activity not found",
      error: "No activity found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only delete activities in their own journeys unless they're an admin
  if (activity.journey.creatorId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to delete this activity",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Delete the activity
  await db.delete(activities).where(eq(activities.id, id));

  return {
    success: true,
    message: "Activity deleted successfully",
  };
};
