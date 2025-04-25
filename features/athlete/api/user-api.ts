import { client } from "@/lib/hono-client";
import type { User } from "better-auth";

/**
 * Get all users
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await client.api.user.$get();

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData ? JSON.stringify(errorData) : "Failed to fetch users");
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error("Invalid response from server");
    }

    return data.data.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
