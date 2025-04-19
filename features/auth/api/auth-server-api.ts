import "server-only";

import { handleApiResponse, serverApi } from "@/lib/api-client";
import type { UserWithAthleteProfile } from "../types/user";

/**
 * Get user with athlete profile using axios
 * @param id User ID
 * @returns User object with athlete profile
 */
export const getUserWithAthleteUsingFetch = async (id: string): Promise<UserWithAthleteProfile> => {
  try {
    // Make the API call using our centralized API client
    const response = await serverApi.get<UserWithAthleteProfile>(`/user/${id}/athlete`);

    // Extract and return the data
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching user with athlete:", error);
    throw error;
  }
};
