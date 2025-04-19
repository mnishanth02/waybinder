import "server-only";

import { env } from "@/env/client-env";
import axios from "axios";
import { headers } from "next/headers";

// Use the correct server URL for API calls - this should be the same as your app URL
const BASE_URL = env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * Get user with athlete profile using fetch
 * @param id User ID
 * @returns User object with athlete profile
 */
export const getUserWithAthleteUsingFetch = async (id: string) => {
  try {
    // Forward headers from the client request to the API call
    const headersList = headers();

    // Make the API call using fetch with proper headers
    const response = await fetch(`${BASE_URL}/api/user/${id}/athlete`, {
      headers: Object.fromEntries((await headersList).entries()),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Invalid response from server");
    }

    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Get user with athlete profile using Axios
 * @param id User ID
 * @returns User object with athlete profile
 */
const _getUserWithAthleteUsingAxios = async (id: string) => {
  try {
    // Create an axios instance with the proper configuration
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      withCredentials: true, // This is important for sending cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Make the API call
    const response = await axiosInstance.get(`/api/user/${id}/athlete`);

    console.log("axios result->", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Invalid response from server");
    }

    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
