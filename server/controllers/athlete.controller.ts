import type {
  AthleteOnboardingFormValues,
  AthleteUpdateFormValues,
} from "@/lib/validations/athlete-onboarding";
import { ApiStatusCode } from "@/types/api";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db";
import { athleteProfiles } from "../db/schema";

/**
 * @api {post} /athletes Create Athlete
 * @apiGroup Athletes
 * @access Private
 */
export const createAthlete = async (c: Context) => {
  const body = (await c.req.json()) as AthleteOnboardingFormValues;
  const newAthlete = await db.insert(athleteProfiles).values({
    userId: c.get("user").id,
    athleteUniqueId: body.basicInfo.email,
    firstName: body.basicInfo.firstName,
    lastName: body.basicInfo.lastName,
    email: body.basicInfo.email,
    gender: body.basicInfo.gender,
    ...body,
  });

  return c.json(newAthlete, ApiStatusCode.CREATED);
};

/**
 * @api {get} /athletes Get All Athletes
 * @apiGroup Athletes
 * @access Public
 */
export const getAthletes = async (c: Context) => {
  const allAthletes = await db.query.athleteProfiles.findMany();
  return c.json({
    success: true,
    data: allAthletes,
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
  const body = (await c.req.json()) as AthleteUpdateFormValues;

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

  // Prepare update data while preserving existing structure
  const updateData = {
    ...body,
    updatedAt: new Date(),
  };

  // Update athlete profile
  const updatedAthlete = await db
    .update(athleteProfiles)
    .set(updateData)
    .where(eq(athleteProfiles.id, id))
    .returning();

  // Fetch the updated athlete profile
  // const updatedAthlete = await db.query.athleteProfiles.findFirst({
  //     where: eq(athleteProfiles.id, id)
  // });

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
