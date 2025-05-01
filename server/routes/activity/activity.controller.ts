import { formatDateOnly, isDateWithinRange, prepareDayNumber } from "@/lib/utils/date-utils";
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
  body: Omit<ActivityTypeInsert, "activityUniqueId" | "journeyId"> & { journeyId: string },
  userId: string
) => {
  // Verify that the journey exists and the user has access to it
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.journeyUniqueId, body.journeyId),
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

  // Validate that the activity date is within the journey date range
  if (!isDateWithinRange(body.activityDate, journey.startDate, journey.endDate)) {
    return {
      success: false,
      message: "Invalid activity date",
      error: "Activity date must be within the journey date range",
      statusCode: ApiStatusCode.BAD_REQUEST,
    };
  }

  // Generate a unique ID for the activity
  const activityUniqueId = generateActivityUniqueId(body.title);

  // Check if there's already an activity with the same date and order
  if (body.activityDate && body.orderWithinDay) {
    const existingActivity = await db.query.activities.findFirst({
      where: and(
        eq(activities.journeyId, journey.id),
        eq(activities.activityDate, body.activityDate),
        eq(activities.orderWithinDay, body.orderWithinDay)
      ),
    });

    if (existingActivity) {
      return {
        success: false,
        message: "Activity order conflict",
        error: `An activity with order ${body.orderWithinDay} already exists for the selected date. Please choose a different order.`,
        statusCode: ApiStatusCode.BAD_REQUEST,
      };
    }
  }

  // Calculate the day number based on the activity date and journey start date
  const dayNumber = prepareDayNumber(body.activityDate, journey.startDate);

  // Create the activity with the generated values and the actual journey ID
  const newActivity: ActivityTypeInsert = {
    ...body,
    journeyId: journey.id, // Use the actual journey ID from the database
    activityUniqueId,
    dayNumber, // Set the calculated day number
    // Convert to date-only format (without time component)
    activityDate: body.activityDate,
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
  date?: string; // Optional date filter
}) => {
  const {
    limit,
    page,
    journeyId,
    activityType,
    search,
    sortBy = "activityDate",
    sortOrder = "asc",
    date,
  } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build the where clause
  let whereClause: SQL<unknown> | undefined = undefined;

  if (journeyId) {
    // First try to find the journey by its unique ID
    const journey = await db.query.journeys.findFirst({
      where: eq(journeys.journeyUniqueId, journeyId),
      columns: { id: true },
    });

    // If found by unique ID, use the actual database ID
    if (journey) {
      const journeyCondition = eq(activities.journeyId, journey.id);
      whereClause = whereClause ? and(whereClause, journeyCondition) : journeyCondition;
    } else {
      // Otherwise, try using the ID directly (might be the actual database ID)
      const journeyCondition = eq(activities.journeyId, journeyId);
      whereClause = whereClause ? and(whereClause, journeyCondition) : journeyCondition;
    }
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

  // Add date filter if provided
  if (date) {
    try {
      // For date-only fields, we can directly compare with the date string
      // Format the date as YYYY-MM-DD for comparison
      const formattedDate = formatDateOnly(new Date(date));

      const dateCondition = eq(activities.activityDate, formattedDate);

      whereClause = whereClause ? and(whereClause, dateCondition) : dateCondition;
    } catch (error) {
      console.error("Error parsing date filter:", error);
    }
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
      case "dayNumber":
        return activities.dayNumber;
      default:
        // Default to dayNumber if available, otherwise activityDate
        return activities.dayNumber || activities.activityDate;
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
    orderBy: [
      // First order by day number or activity date
      orderByDirection,
      // Then by start time within the same day
      asc(activities.startTime),
    ],
    limit,
    offset,
    with: {
      journey: {
        columns: {
          id: true,
          title: true,
          journeyUniqueId: true,
          startDate: true, // Include start date for day number calculation if needed
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
    date?: string;
  }
) => {
  // First check if the journeyId is a unique ID or a database ID
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.journeyUniqueId, journeyId),
    columns: { id: true },
  });

  // If found by unique ID, use the actual database ID
  const actualJourneyId = journey ? journey.id : journeyId;

  return getActivities({
    ...params,
    journeyId: actualJourneyId,
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

  // Validate that the activity date is within the journey date range if it's being updated
  if (
    updateData.activityDate &&
    !isDateWithinRange(
      updateData.activityDate,
      activity.journey.startDate,
      activity.journey.endDate
    )
  ) {
    return {
      success: false,
      message: "Invalid activity date",
      error: "Activity date must be within the journey date range",
      statusCode: ApiStatusCode.BAD_REQUEST,
    };
  }

  // No need to format the date - it will be properly stored in the database

  // Check if we're updating the order and if there's a conflict
  if (updateData.activityDate && updateData.orderWithinDay) {
    const existingActivity = await db.query.activities.findFirst({
      where: and(
        eq(activities.journeyId, activity.journeyId),
        eq(activities.activityDate, updateData.activityDate),
        eq(activities.orderWithinDay, updateData.orderWithinDay),
        sql`${activities.id} != ${id}` // Exclude the current activity
      ),
    });

    if (existingActivity) {
      return {
        success: false,
        message: "Activity order conflict",
        error: `An activity with order ${updateData.orderWithinDay} already exists for the selected date. Please choose a different order.`,
        statusCode: ApiStatusCode.BAD_REQUEST,
      };
    }
  }

  // Calculate day number if activity date is being updated
  let dayNumber = updateData.dayNumber;
  if (updateData.activityDate && !updateData.dayNumber) {
    // Fetch journey start date if not already available
    if (!activity.journey.startDate) {
      const journeyData = await db.query.journeys.findFirst({
        where: eq(journeys.id, activity.journeyId),
        columns: { startDate: true },
      });

      if (journeyData) {
        dayNumber = prepareDayNumber(updateData.activityDate, journeyData.startDate);
      }
    } else {
      dayNumber = prepareDayNumber(updateData.activityDate, activity.journey.startDate);
    }
  }

  // Update activity with the updatedAt timestamp and calculated day number
  const result = await db
    .update(activities)
    .set({
      ...updateData,
      dayNumber,
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
