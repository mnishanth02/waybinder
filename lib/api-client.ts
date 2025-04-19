import { env } from "@/env/client-env";
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { headers as nextHeaders } from "next/headers";

// Base URL for API calls
const BASE_URL = env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Standard API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for consistent error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return data directly if successful
    return response;
  },
  (error: AxiosError) => {
    // Handle error responses
    const errorResponse = {
      success: false,
      message: error.message || "An error occurred",
      error: error.response?.data || error,
    };

    return Promise.reject(errorResponse);
  }
);

/**
 * Server-side API client that forwards headers from the Next.js request
 * Use this in server components or server actions
 */
export const serverApi = {
  /**
   * Make a GET request with headers forwarded from the Next.js request
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Get headers from Next.js request
      const headersList = nextHeaders();
      const headersObj = Object.fromEntries((await headersList).entries());

      // Make request with forwarded headers
      const response = await axiosInstance.get<ApiResponse<T>>(url, {
        ...config,
        headers: {
          ...headersObj,
          ...config?.headers,
        },
      });

      return response.data;
    } catch (error: unknown) {
      console.error(`GET ${url} error:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request with headers forwarded from the Next.js request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      // Get headers from Next.js request
      const headersList = nextHeaders();
      const headersObj = Object.fromEntries((await headersList).entries());

      // Make request with forwarded headers
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, {
        ...config,
        headers: {
          ...headersObj,
          ...config?.headers,
        },
      });

      return response.data;
    } catch (error: unknown) {
      console.error(`POST ${url} error:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request with headers forwarded from the Next.js request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      // Get headers from Next.js request
      const headersList = nextHeaders();
      const headersObj = Object.fromEntries((await headersList).entries());

      // Make request with forwarded headers
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, {
        ...config,
        headers: {
          ...headersObj,
          ...config?.headers,
        },
      });

      return response.data;
    } catch (error: unknown) {
      console.error(`PUT ${url} error:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request with headers forwarded from the Next.js request
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Get headers from Next.js request
      const headersList = nextHeaders();
      const headersObj = Object.fromEntries((await headersList).entries());

      // Make request with forwarded headers
      const response = await axiosInstance.delete<ApiResponse<T>>(url, {
        ...config,
        headers: {
          ...headersObj,
          ...config?.headers,
        },
      });

      return response.data;
    } catch (error: unknown) {
      console.error(`DELETE ${url} error:`, error);
      throw error;
    }
  },
};

/**
 * Client-side API client
 * Use this in client components
 */
export const clientApi = {
  /**
   * Make a GET request
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      console.error(`GET ${url} error:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      console.error(`POST ${url} error:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      console.error(`PUT ${url} error:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      console.error(`DELETE ${url} error:`, error);
      throw error;
    }
  },
};

/**
 * Helper function to handle API responses and extract data
 * Throws an error if the response is not successful
 */
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "Invalid response from server");
  }

  if (response.data === undefined) {
    throw new Error("No data returned from server");
  }

  return response.data;
}
