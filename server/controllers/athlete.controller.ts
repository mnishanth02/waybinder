import { ApiStatusCode } from "@/types/api";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db";
import { athleteProfiles } from "../db/schema";
import type { NewAthleteProfileType } from "../db/schema/athlete-schema";

/**
 * @api {post} /athletes Create Athlete
 * @apiGroup Athletes
 * @access Private
 */
export const createAthlete = async (c: Context) => {
  const body = (await c.req.json()) as NewAthleteProfileType;

  const newAthlete = await db.insert(athleteProfiles).values(body);
  return c.json(
    {
      success: true,
      message: "Athlete created successfully",
      data: newAthlete,
    },
    ApiStatusCode.CREATED
  );
};

/**
 * @api {get} /athletes Get All Athletes
 * @apiGroup Athletes
 * @access Public
 */
export const getAthletes = async (c: Context) => {
  // Get query parameters with defaults
  const limit = Number(c.req.query("limit") || "10");
  const page = Number(c.req.query("page") || "1");
  const activity = c.req.query("activity")?.trim();
  const fitnessLevel = c.req.query("fitnessLevel");
  const search = c.req.query("search")?.trim();

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Get all athletes first (we'll filter in memory for complex json fields)
  let athletes = await db.query.athleteProfiles.findMany({
    orderBy: [athleteProfiles.updatedAt],
  });

  // Filter for activity (JSON fields)
  if (activity) {
    athletes = athletes.filter((athlete) => {
      // Check all activity fields
      const activities = [
        athlete.primaryActivity1?.activity,
        athlete.primaryActivity2?.activity,
        athlete.primaryActivity3?.activity,
      ];
      return activities.some((act) => act?.toLowerCase().includes(activity.toLowerCase()));
    });
  }

  // Filter by fitness level
  if (fitnessLevel) {
    athletes = athletes.filter((athlete) => athlete.fitnessLevel === fitnessLevel);
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    athletes = athletes.filter((athlete) => {
      // Check name fields and location
      return (
        athlete.firstName?.toLowerCase().includes(searchLower) ||
        athlete.lastName?.toLowerCase().includes(searchLower) ||
        athlete.displayName?.toLowerCase().includes(searchLower) ||
        athlete.location?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Get total count for pagination
  const totalCount = athletes.length;
  const totalPages = Math.ceil(totalCount / limit);

  // Apply pagination in memory
  const paginatedAthletes = athletes.slice(offset, offset + limit);

  return c.json({
    success: true,
    data: paginatedAthletes,
    meta: {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    },
  });
};

/**
 * @api {get} /athletes/:id Get Athlete by ID
 * @apiGroup Athletes
 * @access Public
 */
export const getAthleteById = async (c: Context) => {
  const id = c.req.param("id");

  const athlete = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.id, id),
  });

  if (!athlete) {
    return c.json(
      {
        success: false,
        message: "Athlete not found",
        error: "No athlete found with the provided ID",
      },
      ApiStatusCode.NOT_FOUND
    );
  }

  return c.json({
    success: true,
    data: athlete,
  });
};

/**
 * @api {get} /athletes/me Get Current User's Athlete Profile
 * @apiGroup Athletes
 * @access Private
 */
export const getMyAthleteProfile = async (c: Context) => {
  const user = c.get("user");

  if (!user) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: "User authentication required",
      },
      ApiStatusCode.UNAUTHORIZED
    );
  }

  const athlete = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.userId, user.id),
  });

  if (!athlete) {
    return c.json(
      {
        success: false,
        message: "Athlete profile not found",
        error: "No athlete profile found for this user",
      },
      ApiStatusCode.NOT_FOUND
    );
  }

  return c.json({
    success: true,
    data: athlete,
  });
};

/**
 * @api {put} /athletes/:id Update Athlete
 * @apiGroup Athletes
 * @access Private
 */
export const updateAthlete = async (c: Context) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const updateData = (await c.req.json()) as Partial<NewAthleteProfileType>;

  // Find the athlete to verify ownership
  const athlete = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.id, id),
  });

  if (!athlete) {
    return c.json(
      {
        success: false,
        message: "Athlete not found",
        error: "No athlete found with the provided ID",
      },
      ApiStatusCode.NOT_FOUND
    );
  }

  // Ensure user can only update their own profile unless they're an admin
  if (athlete.userId !== user.id && !user.isAdmin) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: "You do not have permission to update this athlete profile",
      },
      ApiStatusCode.FORBIDDEN
    );
  }

  // Update athlete profile with the updatedAt timestamp
  const updatedAthlete = await db
    .update(athleteProfiles)
    .set(updateData)
    .where(eq(athleteProfiles.id, id))
    .returning();

  return c.json({
    success: true,
    message: "Athlete profile updated successfully",
    data: updatedAthlete,
  });
};

/**
 * @api {delete} /athletes/:id Delete Athlete
 * @apiGroup Athletes
 * @access Private
 */
export const deleteAthlete = async (c: Context) => {
  const id = c.req.param("id");
  const user = c.get("user");

  // Find the athlete to verify ownership
  const athlete = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.id, id),
  });

  if (!athlete) {
    return c.json(
      {
        success: false,
        message: "Athlete not found",
        error: "No athlete found with the provided ID",
      },
      ApiStatusCode.NOT_FOUND
    );
  }

  // Ensure user can only delete their own profile unless they're an admin
  if (athlete.userId !== user.id && !user.isAdmin) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: "You do not have permission to delete this athlete profile",
      },
      ApiStatusCode.FORBIDDEN
    );
  }

  // Delete athlete profile
  await db.delete(athleteProfiles).where(eq(athleteProfiles.id, id));

  return c.json({
    success: true,
    message: "Athlete profile deleted successfully",
    data: { id },
  });
};

/**
 * @api {get} /athletes/unique/:uniqueId Get Athlete by Unique ID
 * @apiGroup Athletes
 * @access Public
 */
export const getAthleteByUniqueId = async (c: Context) => {
  const uniqueId = c.req.param("id");

  const athlete = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.athleteUniqueId, uniqueId),
  });

  if (!athlete) {
    return c.json(
      {
        success: false,
        message: "Athlete not found",
        error: "No athlete found with the provided unique ID",
      },
      ApiStatusCode.NOT_FOUND
    );
  }

  return c.json({
    success: true,
    data: athlete,
  });
};
