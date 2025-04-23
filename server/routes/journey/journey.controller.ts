import { generateJourneyUniqueId, generateSlug } from "@/lib/utils/slug";
import type { UserTypeSelect } from "@/server/db/schema";
import { ApiStatusCode } from "@/types/api";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../db";
import { journeys } from "../../db/schema";
import type { NewJourneyType } from "../../db/schema/journey-schema";

/**
 * @api {post} /journeys Create Journey
 * @apiGroup Journeys
 * @access Private
 */
export const createJourney = async (
  body: Omit<NewJourneyType, "creatorId" | "journeyUniqueId" | "slug">,
  userId: string
) => {
  // Generate a unique ID and slug for the journey
  const journeyUniqueId = generateJourneyUniqueId(body.title);
  const slug = generateSlug(body.title);

  // Create the journey with the generated values
  const newJourney: NewJourneyType = {
    ...body,
    creatorId: userId,
    journeyUniqueId,
    slug,
  };

  // Insert the journey into the database
  const result = await db.insert(journeys).values(newJourney).returning();
  const createdJourney = result[0];

  if (!createdJourney) {
    return {
      success: false,
      message: "Failed to create journey",
      error: "An error occurred while creating the journey",
    };
  }

  return {
    success: true,
    message: "Journey created successfully",
    data: {
      id: createdJourney.id,
      uniqueId: createdJourney.journeyUniqueId,
      slug: createdJourney.slug,
    },
  };
};

/**
 * @api {get} /journeys Get All Journeys
 * @apiGroup Journeys
 * @access Public
 */
export const getJourneys = async (params: {
  limit: number;
  page: number;
  journeyType?: string;
  search?: string;
  creatorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const {
    limit,
    page,
    journeyType,
    search,
    creatorId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build the where clause
  let whereClause: any = undefined;

  if (journeyType) {
    const typeCondition = eq(journeys.journeyType, journeyType as any);
    whereClause = whereClause ? and(whereClause, typeCondition) : typeCondition;
  }

  if (creatorId) {
    const creatorCondition = eq(journeys.creatorId, creatorId);
    whereClause = whereClause ? and(whereClause, creatorCondition) : creatorCondition;
  }

  if (search) {
    const searchCondition = or(
      ilike(journeys.title, `%${search}%`),
      ilike(journeys.description || "", `%${search}%`),
      ilike(journeys.location || "", `%${search}%`)
    );
    whereClause = whereClause ? and(whereClause, searchCondition) : searchCondition;
  }

  // Determine sort field and order
  const orderByField =
    sortBy === "title"
      ? journeys.title
      : sortBy === "startDate"
        ? journeys.startDate
        : sortBy === "endDate"
          ? journeys.endDate
          : journeys.createdAt;

  const orderByDirection = sortOrder === "asc" ? asc(orderByField) : desc(orderByField);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(journeys)
    .where(whereClause)
    .then((result) => result[0]?.count || 0);

  const totalCount = Number(countResult);
  const totalPages = Math.ceil(totalCount / limit);

  // Get journeys with pagination and sorting
  const journeyList = await db.query.journeys.findMany({
    where: whereClause,
    orderBy: [orderByDirection],
    limit,
    offset,
    with: {
      creator: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return {
    success: true,
    data: journeyList,
    meta: {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    },
  };
};

/**
 * @api {get} /journeys/:id Get Journey by ID
 * @apiGroup Journeys
 * @access Public
 */
export const getJourneyById = async (id: string) => {
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.id, id),
    with: {
      creator: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!journey) {
    return {
      success: false,
      message: "Journey not found",
      error: "No journey found with the provided ID",
    };
  }

  return {
    success: true,
    data: journey,
  };
};

/**
 * @api {get} /journeys/unique/:uniqueId Get Journey by Unique ID
 * @apiGroup Journeys
 * @access Public
 */
export const getJourneyByUniqueId = async (uniqueId: string) => {
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.journeyUniqueId, uniqueId),
    with: {
      creator: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!journey) {
    return {
      success: false,
      message: "Journey not found",
      error: "No journey found with the provided unique ID",
    };
  }

  return {
    success: true,
    data: journey,
  };
};

/**
 * @api {get} /journeys/slug/:slug Get Journey by Slug
 * @apiGroup Journeys
 * @access Public
 */
export const getJourneyBySlug = async (slug: string) => {
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.slug, slug),
    with: {
      creator: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!journey) {
    return {
      success: false,
      message: "Journey not found",
      error: "No journey found with the provided slug",
    };
  }

  return {
    success: true,
    data: journey,
  };
};

/**
 * @api {get} /journeys/me Get Current User's Journeys
 * @apiGroup Journeys
 * @access Private
 */
export const getMyJourneys = async (
  userId: string,
  params: {
    limit: number;
    page: number;
    journeyType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) => {
  return getJourneys({
    ...params,
    creatorId: userId,
  });
};

/**
 * @api {put} /journeys/:id Update Journey
 * @apiGroup Journeys
 * @access Private
 */
export const updateJourney = async (
  id: string,
  updateData: Partial<NewJourneyType>,
  user: UserTypeSelect
) => {
  // Find the journey to verify ownership
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.id, id),
  });

  if (!journey) {
    return {
      success: false,
      message: "Journey not found",
      error: "No journey found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only update their own journeys unless they're an admin
  if (journey.creatorId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to update this journey",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // If title is being updated, generate a new slug
  if (updateData.title && updateData.title !== journey.title) {
    updateData.slug = generateSlug(updateData.title);
  }

  // Update journey with the updatedAt timestamp
  const result = await db.update(journeys).set(updateData).where(eq(journeys.id, id)).returning();

  const updatedJourney = result[0];

  return {
    success: true,
    message: "Journey updated successfully",
    data: updatedJourney,
  };
};

/**
 * @api {delete} /journeys/:id Delete Journey
 * @apiGroup Journeys
 * @access Private
 */
export const deleteJourney = async (id: string, user: UserTypeSelect) => {
  // Find the journey to verify ownership
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.id, id),
  });

  if (!journey) {
    return {
      success: false,
      message: "Journey not found",
      error: "No journey found with the provided ID",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  }

  // Ensure user can only delete their own journeys unless they're an admin
  if (journey.creatorId !== user.id && !user.isAdmin) {
    return {
      success: false,
      message: "Forbidden",
      error: "You do not have permission to delete this journey",
      statusCode: ApiStatusCode.FORBIDDEN,
    };
  }

  // Delete journey
  await db.delete(journeys).where(eq(journeys.id, id));

  return {
    success: true,
    message: "Journey deleted successfully",
    data: { id },
  };
};
