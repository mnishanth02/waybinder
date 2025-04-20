import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import type { User } from "better-auth";
import { eq } from "drizzle-orm";

/**
 * @api {get} /users Get All Users
 * @apiGroup Users
 * @access Private
 */
export const getUsers = async () => {
  const allUsers = await db.query.users.findMany();
  return {
    success: true,
    data: allUsers,
  };
};

/**
 * @api {get} /users/:id Get Single User
 * @apiGroup Users
 * @access Private
 */
export const getUserById = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
      error: "No user found with the provided ID",
    };
  }

  return {
    success: true,
    data: user,
  };
};

/**
 * @api {put} /users/profile Edit User Profile
 * @apiGroup Users
 * @access Private
 */
export const editProfile = async (body: User) => {
  const updateFields: User = {} as User;

  if (body.name !== "") updateFields.name = body.name;
  if (body.image !== "") updateFields.image = body.image;

  if (Object.keys(updateFields).length === 0) {
    return {
      success: false,
      message: "No fields to update",
      error: "At least one field must be provided for update",
    };
  }

  // Update the user's profile with only the provided fields
  const updatedProfile = await db.update(users).set(updateFields).where(eq(users.id, body.id));

  return {
    success: true,
    message: "Profile updated successfully",
    data: updatedProfile,
  };
};
