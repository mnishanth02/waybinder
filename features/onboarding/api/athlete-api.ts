import type {
  AthleteOnboardingFormValues,
  AthleteUpdateFormValues,
} from "@/features/onboarding/athlete-onboarding-validator";
import { AthleteNotFoundError } from "@/lib/errors/athlete-error";
import { client } from "@/lib/hono-client";
import { nanoid } from "nanoid";

// Define the enum types based on the Zod schema
type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";
type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "professional";
type FitnessLevel = "beginner" | "intermediate" | "advanced";
type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "unknown";

// Activity type to avoid any
interface Activity {
  activity: string;
  experienceLevel: ExperienceLevel;
}

// Helper functions to transform specific sections of athlete data
const transformBasicInfo = (athlete: Record<string, unknown>) => ({
  firstName: athlete.firstName as string,
  lastName: athlete.lastName as string,
  email: athlete.email as string,
  dateOfBirth: athlete.dateOfBirth ? new Date(athlete.dateOfBirth as string) : undefined,
  gender: athlete.gender as Gender,
  displayName: (athlete.displayName as string) ?? undefined,
  location: (athlete.location as string) ?? undefined,
  profileImageUrl: (athlete.profileImageUrl as string) ?? undefined,
  coverPhotoUrl: (athlete.coverPhotoUrl as string) ?? undefined,
  // These are UI-only fields, not sent to/from API
  profileImage: undefined,
  coverPhoto: undefined,
});

const transformActivity = (
  activity: Activity | null | undefined,
  defaultActivity: Activity = { activity: "", experienceLevel: "beginner" }
): Activity => {
  if (!activity) {
    return defaultActivity;
  }

  return {
    activity: activity.activity,
    experienceLevel: activity.experienceLevel,
  };
};

const transformSportsActivity = (athlete: Record<string, unknown>) => {
  // Extract activity data with proper typing
  const primaryActivity1 = athlete.primaryActivity1 as Activity | null | undefined;
  const primaryActivity2 = athlete.primaryActivity2 as Activity | null | undefined;
  const primaryActivity3 = athlete.primaryActivity3 as Activity | null | undefined;

  return {
    primaryActivity1: transformActivity(primaryActivity1),
    primaryActivity2: primaryActivity2 ? transformActivity(primaryActivity2) : undefined,
    primaryActivity3: primaryActivity3 ? transformActivity(primaryActivity3) : undefined,
    fitnessLevel: athlete.fitnessLevel as FitnessLevel,
    height: (athlete.height as string) ?? undefined,
    weight: (athlete.weight as string) ?? undefined,
  };
};

const transformSocialLinks = (athlete: Record<string, unknown>) => ({
  websiteURLs: athlete.websiteURLs as string[] | undefined,
  stravaLinks: athlete.stravaLinks as string[] | undefined,
  instagramLinks: athlete.instagramLinks as string[] | undefined,
  facebookLinks: athlete.facebookLinks as string[] | undefined,
  twitterLinks: athlete.twitterLinks as string[] | undefined,
  otherSocialLinks: athlete.otherSocialLinks as Array<{ label: string; url: string }> | undefined,
  youtubeURLs: athlete.youtubeURLs as string[] | undefined,
});

const transformMedicalInfo = (athlete: Record<string, unknown>) => ({
  emergencyContact: athlete.emergencyContact as
    | {
        name: string;
        phoneNumber: string;
        relationship: string;
      }
    | undefined,
  allergies: (athlete.allergies as string) ?? undefined,
  medicalConditions: (athlete.medicalConditions as string) ?? undefined,
  medications: (athlete.medications as string) ?? undefined,
  bloodGroup: athlete.bloodGroup as BloodGroup | undefined,
});

const transformAdditionalInfo = (athlete: Record<string, unknown>) => ({
  bio: (athlete.bio as string) ?? undefined,
  goals: (athlete.goals as string) ?? undefined,
  sponsors: (athlete.sponsors as string) ?? undefined,
  ...transformSocialLinks(athlete),
  ...transformMedicalInfo(athlete),
  privacySettings: athlete.privacySettings as Record<string, boolean> | undefined,
  communicationPreferences: athlete.communicationPreferences as Record<string, boolean> | undefined,
});

// Transform flat data structure from API to nested structure for UI forms
const transformToNested = (flatData: unknown): AthleteOnboardingFormValues => {
  // Type guard to ensure flatData has necessary properties
  const athlete = flatData as Record<string, unknown>;

  return {
    basicInfo: transformBasicInfo(athlete),
    sportsActivity: transformSportsActivity(athlete),
    additionalInfo: transformAdditionalInfo(athlete),
  };
};

// Type for getAthletes query parameters to match athleteQuerySchema
interface GetAthletesParams {
  limit?: number;
  page?: number;
  activity?: string;
  fitnessLevel?: string;
  search?: string;
}

// Helper function to convert params to query string parameters
const convertAthletesParamsToQueryString = (params?: GetAthletesParams): Record<string, string> => {
  const queryParams: Record<string, string> = {};

  if (params) {
    if (params.limit !== undefined) queryParams.limit = params.limit.toString();
    if (params.page !== undefined) queryParams.page = params.page.toString();
    if (params.activity) queryParams.activity = params.activity;
    if (params.fitnessLevel) queryParams.fitnessLevel = params.fitnessLevel;
    if (params.search) queryParams.search = params.search;
  }

  return queryParams;
};

// Helper function to handle API errors
const handleAthleteApiError = async (
  response: Response,
  defaultMessage: string
): Promise<never> => {
  const errorData = await response.json().catch(() => null);
  throw new Error(errorData ? JSON.stringify(errorData) : defaultMessage);
};

// Define API response type
interface ApiResponse<T> {
  success: boolean;
  data: T | T[] | null;
  message?: string;
}

// Helper function to process athlete response data
const processAthleteResponse = (data: ApiResponse<unknown>): AthleteOnboardingFormValues[] => {
  if (!data.success || !data.data) {
    throw new Error("Invalid response from server");
  }

  // Handle array response
  const flatAthletes = Array.isArray(data.data) ? data.data : [data.data];

  // Transform to UI format
  return flatAthletes.map((athlete) => transformToNested(athlete));
};

/**
 * Get all athletes with optional filtering and pagination
 */
export const getAthletes = async (
  params?: GetAthletesParams
): Promise<AthleteOnboardingFormValues[]> => {
  // Convert params to query string
  const queryParams = convertAthletesParamsToQueryString(params);

  const response = await client.api.athlete.$get({
    query: queryParams,
  });

  if (!response.ok) {
    await handleAthleteApiError(response, "Failed to fetch athletes");
  }

  const data = await response.json();
  return processAthleteResponse(data);
};

/**
 * Get athlete by ID
 */
export const getAthleteById = async (id: string): Promise<AthleteOnboardingFormValues> => {
  const response = await client.api.athlete[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData
      ? JSON.stringify(errorData)
      : `Failed to fetch athlete with ID ${id}`;

    // Check if it's a 404 Not Found error
    if (response.status === 404) {
      throw new AthleteNotFoundError(`Athlete with unique ID ${id} not found`, id);
    }

    // For other HTTP errors
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Handle API-level errors where HTTP status might be 200 but the operation failed
  if (!data.success || !data.data) {
    throw new AthleteNotFoundError(`Athlete with unique ID ${id} not found in response`, id);
  }

  return transformToNested(data.data);
};

/**
 * Get athlete by unique ID (non-primary key)
 * @throws {AthleteNotFoundError} When athlete with the given unique ID is not found
 * @throws {Error} For other API or network errors
 * @returns {Promise<AthleteOnboardingFormValues | null>} The athlete data or null if not found
 */
export const getAthleteByUniqueId = async (
  id: string
): Promise<AthleteOnboardingFormValues | null> => {
  // Validate input to prevent unnecessary API calls
  if (!id) {
    console.warn("getAthleteByUniqueId called with empty ID");
    return null;
  }

  try {
    const response = await client.api.athlete.unique[":id"].$get({
      param: { id },
    });

    // Handle HTTP error responses
    if (!response.ok) {
      // For 404 errors, return null instead of throwing an error
      // This allows the page component to handle the not-found case gracefully
      if (response.status === 404) {
        console.info(`Athlete with unique ID ${id} not found (404 response)`);
        return null;
      }

      // For other HTTP errors, parse the error data if possible
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData
        ? JSON.stringify(errorData)
        : `Failed to fetch athlete with unique ID ${id}`;

      // Throw a general error for non-404 HTTP errors
      throw new Error(errorMessage);
    }

    // Parse the response data
    const data = await response.json();

    // Handle API-level errors where HTTP status might be 200 but the operation failed
    if (!data.success || !data.data) {
      console.info(`Athlete with unique ID ${id} not found (API returned no data)`);
      return null;
    }

    // Transform and return the data
    return transformToNested(data.data);
  } catch (error) {
    // Log the error for debugging
    console.error(`Error fetching athlete with ID ${id}:`, error);

    // If it's already an AthleteNotFoundError, convert it to a null return
    if (error instanceof AthleteNotFoundError) {
      return null;
    }

    // If the error message suggests the athlete wasn't found, return null
    if (error instanceof Error && error.message.toLowerCase().includes("not found")) {
      return null;
    }

    // For other errors (network issues, server errors), re-throw
    throw error;
  }
};

/**
 * Get current athlete's profile
 */
export const getMyAthleteProfile = async (): Promise<AthleteOnboardingFormValues> => {
  const response = await client.api.athlete.me.$get();

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to fetch athlete profile");
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("My athlete profile not found in response");
  }

  return transformToNested(data.data);
};

/**
 * Create a new athlete profile
 */
export const createAthlete = async (data: AthleteOnboardingFormValues) => {
  // Validate required fields from the form
  if (!data.basicInfo?.firstName || !data.basicInfo?.lastName || !data.basicInfo?.email) {
    throw new Error("First name, last name, and email are required fields");
  }

  // The required fields for the athlete creation request
  const requiredFields = {
    firstName: data.basicInfo.firstName,
    lastName: data.basicInfo.lastName,
    email: data.basicInfo.email,
    athleteUniqueId: `${data.basicInfo.firstName}_${nanoid(10)}`,
  };

  // Additional optional fields
  const optionalFields = {
    // Optional fields
    gender: data.basicInfo.gender,
    dateOfBirth:
      data.basicInfo.dateOfBirth instanceof Date
        ? data.basicInfo.dateOfBirth.toISOString().split("T")[0]
        : data.basicInfo.dateOfBirth,
    displayName: data.basicInfo.displayName,
    location: data.basicInfo.location,
    profileImageUrl: data.basicInfo.profileImageUrl,
    coverPhotoUrl: data.basicInfo.coverPhotoUrl,

    // Sports activity
    fitnessLevel: data.sportsActivity?.fitnessLevel,
    primaryActivity1: data.sportsActivity?.primaryActivity1,
    primaryActivity2: data.sportsActivity?.primaryActivity2,
    primaryActivity3: data.sportsActivity?.primaryActivity3,
    height: data.sportsActivity?.height,
    weight: data.sportsActivity?.weight,

    // Additional info
    bio: data.additionalInfo?.bio,
    goals: data.additionalInfo?.goals,
    sponsors: data.additionalInfo?.sponsors,
    websiteURLs: data.additionalInfo?.websiteURLs,
    stravaLinks: data.additionalInfo?.stravaLinks,
    instagramLinks: data.additionalInfo?.instagramLinks,
    facebookLinks: data.additionalInfo?.facebookLinks,
    twitterLinks: data.additionalInfo?.twitterLinks,
    otherSocialLinks: data.additionalInfo?.otherSocialLinks,
    youtubeURLs: data.additionalInfo?.youtubeURLs,
    emergencyContact: data.additionalInfo?.emergencyContact,
    allergies: data.additionalInfo?.allergies,
    medicalConditions: data.additionalInfo?.medicalConditions,
    medications: data.additionalInfo?.medications,
    bloodGroup: data.additionalInfo?.bloodGroup,
    privacySettings: data.additionalInfo?.privacySettings,
    communicationPreferences: data.additionalInfo?.communicationPreferences,
  };

  // Create the full payload, starting with required fields and adding any defined optional fields
  const requestPayload = {
    ...requiredFields,
    ...Object.fromEntries(Object.entries(optionalFields).filter(([_, v]) => v !== undefined)),
  };

  // Type assertion to satisfy the API client
  const response = await client.api.athlete.$post({
    json: requestPayload,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to create athlete profile");
  }

  const responseData = await response.json();

  if (!responseData.success || !responseData.data) {
    throw new Error("No valid data returned after creating athlete profile");
  }

  return responseData.data;
};

/**
 * Update an athlete profile
 */
export const updateAthlete = async (
  id: string,
  data: AthleteUpdateFormValues
): Promise<unknown> => {
  // Extract fields from form data
  const updateAthleteData = {
    // Basic info
    firstName: data.basicInfo?.firstName,
    lastName: data.basicInfo?.lastName,
    email: data.basicInfo?.email,
    gender: data.basicInfo?.gender,
    dateOfBirth:
      data.basicInfo?.dateOfBirth instanceof Date
        ? data.basicInfo?.dateOfBirth.toISOString().split("T")[0]
        : data.basicInfo?.dateOfBirth,
    displayName: data.basicInfo?.displayName,
    location: data.basicInfo?.location,
    profileImageUrl: data.basicInfo?.profileImageUrl,
    coverPhotoUrl: data.basicInfo?.coverPhotoUrl,

    // Sports activity
    fitnessLevel: data.sportsActivity?.fitnessLevel,
    primaryActivity1: data.sportsActivity?.primaryActivity1,
    primaryActivity2: data.sportsActivity?.primaryActivity2,
    primaryActivity3: data.sportsActivity?.primaryActivity3,
    height: data.sportsActivity?.height,
    weight: data.sportsActivity?.weight,

    // Additional info
    bio: data.additionalInfo?.bio,
    goals: data.additionalInfo?.goals,
    sponsors: data.additionalInfo?.sponsors,
    websiteURLs: data.additionalInfo?.websiteURLs,
    stravaLinks: data.additionalInfo?.stravaLinks,
    instagramLinks: data.additionalInfo?.instagramLinks,
    facebookLinks: data.additionalInfo?.facebookLinks,
    twitterLinks: data.additionalInfo?.twitterLinks,
    otherSocialLinks: data.additionalInfo?.otherSocialLinks,
    youtubeURLs: data.additionalInfo?.youtubeURLs,
    emergencyContact: data.additionalInfo?.emergencyContact,
    allergies: data.additionalInfo?.allergies,
    medicalConditions: data.additionalInfo?.medicalConditions,
    medications: data.additionalInfo?.medications,
    bloodGroup: data.additionalInfo?.bloodGroup,
    privacySettings: data.additionalInfo?.privacySettings,
    communicationPreferences: data.additionalInfo?.communicationPreferences,
  };

  // Remove undefined values
  const requestPayload = Object.fromEntries(
    Object.entries(updateAthleteData).filter(([_, v]) => v !== undefined)
  );

  // Type for API request with mandatory fields
  interface UpdateAthleteRequest {
    param: { id: string };
    json: Record<string, unknown>;
  }

  // Use type interface for the API call
  const response = await client.api.athlete[":id"].$put({
    param: { id },
    json: requestPayload,
  } as UpdateAthleteRequest);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to update athlete profile");
  }

  const responseData = await response.json();

  if (!responseData.success || !responseData.data) {
    throw new Error("No valid data returned after updating athlete profile");
  }

  return responseData.data;
};

/**
 * Delete an athlete profile
 */
export const deleteAthlete = async (id: string): Promise<{ id: string }> => {
  const response = await client.api.athlete[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to delete athlete profile");
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Invalid delete response");
  }

  const deletedData = data.data as { id?: string };

  if (!deletedData.id) {
    return { id }; // Fallback to the requested ID
  }

  return { id: deletedData.id };
};
