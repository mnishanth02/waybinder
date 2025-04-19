import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

/**
 * Get user with athlete profile using Axios
 * @param id User ID
 * @returns User object with athlete profile
 */
export const getUserWithAthleteUsingAxios = async (id: string) => {
  try {
    // Make the API call using Axios
    const response = await apiClient.get<ApiResponse>(`/user/${id}/athlete`);

    // Check if the response is successful and contains data
    if (!response.data.success || !response.data.data) {
      throw new Error("Invalid response from server");
    }

    // Return the user data with athlete profile
    return response.data.data;
  } catch (error) {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      throw new Error(
        errorData ? JSON.stringify(errorData) : "Failed to fetch user with athlete profile"
      );
    }

    // Re-throw other errors
    throw error;
  }
};

// Import axios for type checking
import axios from "axios";
