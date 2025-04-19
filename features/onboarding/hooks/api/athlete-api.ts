import { client } from "@/lib/hono-client";
import type {
  AthleteOnboardingFormValues,
  AthleteUpdateFormValues,
} from "@/lib/validations/athlete-onboarding";
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

// Transform flat data structure from API to nested structure for UI forms
const transformToNested = (flatData: unknown): AthleteOnboardingFormValues => {
  // Type guard to ensure flatData has necessary properties
  const athlete = flatData as Record<string, unknown>;

  // Extract activity data with proper typing
  const primaryActivity1 = athlete.primaryActivity1 as Activity | null | undefined;
  const primaryActivity2 = athlete.primaryActivity2 as Activity | null | undefined;
  const primaryActivity3 = athlete.primaryActivity3 as Activity | null | undefined;

  return {
    basicInfo: {
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
    },
    sportsActivity: {
      primaryActivity1: primaryActivity1
        ? {
            activity: primaryActivity1.activity,
            experienceLevel: primaryActivity1.experienceLevel,
          }
        : { activity: "", experienceLevel: "beginner" },
      primaryActivity2: primaryActivity2
        ? {
            activity: primaryActivity2.activity,
            experienceLevel: primaryActivity2.experienceLevel,
          }
        : undefined,
      primaryActivity3: primaryActivity3
        ? {
            activity: primaryActivity3.activity,
            experienceLevel: primaryActivity3.experienceLevel,
          }
        : undefined,
      fitnessLevel: athlete.fitnessLevel as FitnessLevel,
      height: (athlete.height as string) ?? undefined,
      weight: (athlete.weight as string) ?? undefined,
    },
    additionalInfo: {
      bio: (athlete.bio as string) ?? undefined,
      goals: (athlete.goals as string) ?? undefined,
      sponsors: (athlete.sponsors as string) ?? undefined,
      websiteURLs: athlete.websiteURLs as string[] | undefined,
      stravaLinks: athlete.stravaLinks as string[] | undefined,
      instagramLinks: athlete.instagramLinks as string[] | undefined,
      facebookLinks: athlete.facebookLinks as string[] | undefined,
      twitterLinks: athlete.twitterLinks as string[] | undefined,
      otherSocialLinks: athlete.otherSocialLinks as
        | Array<{ label: string; url: string }>
        | undefined,
      youtubeURLs: athlete.youtubeURLs as string[] | undefined,
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
      privacySettings: athlete.privacySettings as Record<string, boolean> | undefined,
      communicationPreferences: athlete.communicationPreferences as
        | Record<string, boolean>
        | undefined,
    },
  };
};

// Transform nested UI form data to a flat structure compatible with backend schema
const transformToFlat = (nestedData: AthleteOnboardingFormValues | AthleteUpdateFormValues) => {
  // Extract basic info fields, ensuring required fields are included
  const { profileImage, coverPhoto, dateOfBirth, ...basicRest } = nestedData.basicInfo ?? {};

  // Ensure dateOfBirth is formatted correctly if it exists, otherwise undefined
  const formattedDateOfBirth =
    dateOfBirth instanceof Date
      ? dateOfBirth.toISOString().split("T")[0] // Format as YYYY-MM-DD string
      : dateOfBirth; // Keep as string or undefined

  const { ...sportsRest } = nestedData.sportsActivity ?? {};
  const { ...additionalRest } = nestedData.additionalInfo ?? {};

  // For create operations, generate a unique ID for the athlete if not provided
  const athleteUniqueId = `athlete_${nanoid(10)}`;

  const flatData = {
    // Include required fields
    athleteUniqueId,

    // Add the rest of the flattened data
    ...basicRest,
    ...sportsRest,
    ...additionalRest,
    dateOfBirth: formattedDateOfBirth, // Use the formatted date string
  };

  // Remove undefined/null properties to avoid sending unnecessary fields
  const cleanedFlatData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flatData)) {
    if (value !== undefined && value !== null) {
      cleanedFlatData[key] = value;
    }
  }

  return cleanedFlatData;
};

// Type for getAthletes query parameters to match athleteQuerySchema
interface GetAthletesParams {
  limit?: number;
  page?: number;
  activity?: string;
  fitnessLevel?: string;
  search?: string;
}

/**
 * Get all athletes with optional filtering and pagination
 */
export const getAthletes = async (
  params?: GetAthletesParams
): Promise<AthleteOnboardingFormValues[]> => {
  // Convert numeric values to strings for URL query parameters
  const queryParams: Record<string, string> = {};

  if (params) {
    if (params.limit !== undefined) queryParams.limit = params.limit.toString();
    if (params.page !== undefined) queryParams.page = params.page.toString();
    if (params.activity) queryParams.activity = params.activity;
    if (params.fitnessLevel) queryParams.fitnessLevel = params.fitnessLevel;
    if (params.search) queryParams.search = params.search;
  }

  const response = await client.api.athlete.$get({
    query: queryParams,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to fetch athletes");
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Invalid response from server");
  }

  // Handle array response
  const flatAthletes = Array.isArray(data.data) ? data.data : [data.data];

  // Transform to UI format
  return flatAthletes.map((athlete) => transformToNested(athlete));
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
    throw new Error(
      errorData ? JSON.stringify(errorData) : `Failed to fetch athlete with ID ${id}`
    );
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error(`Athlete with ID ${id} not found in response`);
  }

  return transformToNested(data.data);
};

/**
 * Get athlete by unique ID (non-primary key)
 */
export const getAthleteByUniqueId = async (id: string): Promise<AthleteOnboardingFormValues> => {
  const response = await client.api.athlete.unique[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : `Failed to fetch athlete with unique ID ${id}`
    );
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error(`Athlete with unique ID ${id} not found in response`);
  }

  return transformToNested(data.data);
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
export const createAthlete = async (data: AthleteOnboardingFormValues): Promise<unknown> => {
  // Validate required fields from the form
  if (!data.basicInfo?.firstName || !data.basicInfo?.lastName || !data.basicInfo?.email) {
    throw new Error("First name, last name, and email are required fields");
  }

  // Transform UI form data to a flat structure
  const flatData = transformToFlat(data);

  // Use type assertion to fix Hono client typing issues
  const response = await client.api.athlete.$post({
    json: flatData,
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
  const flatData = transformToFlat(data) as Record<string, unknown>;

  // Create a new payload without athleteUniqueId to prevent modification
  const { athleteUniqueId, ...updatePayload } = flatData;

  // Use type assertion to fix Hono client typing issues
  const response = await client.api.athlete[":id"].$put({
    param: { id },
    json: updatePayload,
  } as {
    param: { id: string };
    json: Record<string, unknown>;
  });

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
