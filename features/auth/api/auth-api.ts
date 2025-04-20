import { client } from "@/lib/hono-client";
import type { User, UserWithAthleteProfile } from "../types/user";

export const getUserById = async (id: string): Promise<User> => {
  const response = await client.api.user[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to fetch user");
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Invalid response from server");
  }

  const user: User = {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt),
    banExpires: data.data.banExpires ? new Date(data.data.banExpires) : null,
  };

  return user;
};

export const getUserWithAthlete = async (id: string): Promise<UserWithAthleteProfile> => {
  const response = await client.api.user[":id"].athlete.$get({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : "Failed to fetch user with athlete profile"
    );
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Invalid response from server");
  }

  const userWithAthlete: UserWithAthleteProfile = {
    ...data.data,

    athleteProfile: {
      ...data.data.athleteProfile,
    },
  };

  return userWithAthlete;
};
