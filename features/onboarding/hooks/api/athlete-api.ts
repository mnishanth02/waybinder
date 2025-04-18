import { client } from "@/lib/hono-client";
import type {
  AthleteOnboardingFormValues,
  AthleteUpdateFormValues,
} from "@/lib/validations/athlete-onboarding";
import { nanoid } from "nanoid";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const transformToNested = (flatData: any): AthleteOnboardingFormValues => {
  return {
    basicInfo: {
      firstName: flatData.firstName,
      lastName: flatData.lastName,
      email: flatData.email,
      dateOfBirth: flatData.dateOfBirth ? new Date(flatData.dateOfBirth) : undefined,
      gender: flatData.gender,
      displayName: flatData.displayName ?? undefined,
      location: flatData.location ?? undefined,
      profileImageUrl: flatData.profileImageUrl ?? undefined,
      coverPhotoUrl: flatData.coverPhotoUrl ?? undefined,
      // profileImage and coverPhoto are handled separately (file uploads)
      profileImage: undefined,
      coverPhoto: undefined,
    },
    sportsActivity: {
      primaryActivity1: flatData.primaryActivity1,
      primaryActivity2: flatData.primaryActivity2 ?? undefined,
      primaryActivity3: flatData.primaryActivity3 ?? undefined,
      fitnessLevel: flatData.fitnessLevel,
      height: flatData.height ?? undefined,
      weight: flatData.weight ?? undefined,
    },
    additionalInfo: {
      bio: flatData.bio ?? undefined,
      goals: flatData.goals ?? undefined,
      sponsors: flatData.sponsors ?? undefined,
      websiteURLs: flatData.websiteURLs ?? undefined,
      stravaLinks: flatData.stravaLinks ?? undefined,
      instagramLinks: flatData.instagramLinks ?? undefined,
      facebookLinks: flatData.facebookLinks ?? undefined,
      twitterLinks: flatData.twitterLinks ?? undefined,
      otherSocialLinks: flatData.otherSocialLinks ?? undefined,
      youtubeURLs: flatData.youtubeURLs ?? undefined,
      emergencyContact: flatData.emergencyContact ?? undefined,
      allergies: flatData.allergies ?? undefined,
      medicalConditions: flatData.medicalConditions ?? undefined,
      medications: flatData.medications ?? undefined,
      bloodGroup: flatData.bloodGroup ?? undefined,
      privacySettings: flatData.privacySettings ?? undefined,
      communicationPreferences: flatData.communicationPreferences ?? undefined,
    },
  };
};

// Transform nested UI form data to a flat structure compatible with backend schema
const transformToFlat = (nestedData: AthleteOnboardingFormValues | AthleteUpdateFormValues) => {
  // Extract basic info fields, ensuring required fields are included
  const { profileImage, coverPhoto, dateOfBirth, ...basicRest } = nestedData.basicInfo ?? {};

  // Type guard to ensure basicRest has the required properties
  // biome-ignore lint/suspicious/noExplicitAny: necessary for dynamic property access
  const basicInfo = basicRest as any;

  // Ensure dateOfBirth is formatted correctly if it exists, otherwise undefined
  const formattedDateOfBirth =
    dateOfBirth instanceof Date
      ? dateOfBirth.toISOString().split("T")[0] // Format as YYYY-MM-DD string
      : dateOfBirth; // Keep as string or undefined

  const { ...sportsRest } = nestedData.sportsActivity ?? {};
  const { ...additionalRest } = nestedData.additionalInfo ?? {};

  // For create operations, generate a unique ID for the athlete if not provided
  // This should be used only if the backend doesn't generate it automatically
  const athleteUniqueId = `athlete_${nanoid(10)}`;

  const flatData = {
    // Include required fields that might be needed by the backend
    athleteUniqueId,

    // Add the rest of the flattened data
    ...basicInfo,
    ...sportsRest,
    ...additionalRest,
    dateOfBirth: formattedDateOfBirth, // Use the formatted date string
  };

  // Remove undefined/null properties
  for (const key in flatData) {
    if (Object.prototype.hasOwnProperty.call(flatData, key)) {
      // biome-ignore lint/suspicious/noExplicitAny: Need dynamic access
      if ((flatData as any)[key] === undefined || (flatData as any)[key] === null) {
        // biome-ignore lint/suspicious/noExplicitAny: Need dynamic access
        delete (flatData as any)[key];
      }
    }
  }

  return flatData;
};

/**
 * Get all athletes
 */
export const getAthletes = async (): Promise<AthleteOnboardingFormValues[]> => {
  const response = await client.api.athlete.$get();

  if (!response.ok) {
    throw new Error("Failed to fetch athletes");
  }
  const data = await response.json();
  // Use unknown as intermediate type to safely cast response data
  const flatAthletes = (Array.isArray(data.data) ? data.data : [data.data]) as unknown[];
  // Keep transforming back for now for other functions using this
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
    throw new Error(`Failed to fetch athlete with ID ${id}`);
  }
  const data = await response.json();
  const flatAthlete = data.data as unknown; // Use unknown as intermediate type
  if (!flatAthlete) {
    throw new Error(`Athlete with ID ${id} not found in response`);
  }
  // Keep transforming back for now
  return transformToNested(flatAthlete);
};

/**
 * Get athlete by unique ID (non-primary key)
 */
export const getAthleteByUniqueId = async (id: string): Promise<AthleteOnboardingFormValues> => {
  const response = await client.api.athlete.unique[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch athlete with unique ID ${id}`);
  }
  const data = await response.json();
  const flatAthlete = data.data as unknown; // Use unknown as intermediate type
  if (!flatAthlete) {
    throw new Error(`Athlete with unique ID ${id} not found in response`);
  }
  // Keep transforming back for now
  return transformToNested(flatAthlete);
};

/**
 * Get current athlete's profile
 */
export const getMyAthleteProfile = async (): Promise<AthleteOnboardingFormValues> => {
  const response = await client.api.athlete.me.$get();

  if (!response.ok) {
    throw new Error("Failed to fetch athlete profile");
  }

  const data = await response.json();
  const flatAthlete = data.data as unknown; // Use unknown as intermediate type
  if (!flatAthlete) {
    throw new Error("My athlete profile not found in response");
  }
  // Keep transforming back for now
  return transformToNested(flatAthlete);
};

/**
 * Create a new athlete profile
 * Sends data compatible with NewAthleteProfileType
 * Returns the created profile data directly from the API
 */
export const createAthlete = async (
  data: AthleteOnboardingFormValues,
  userId: string | object | undefined
): Promise<unknown> => {
  // Extract string userId if an object was passed (like from auth session)
  const userIdStr =
    typeof userId === "object"
      ? // biome-ignore lint/suspicious/noExplicitAny: Needed to handle various user object structures
        (userId as any)?.id
      : typeof userId === "string"
        ? userId
        : undefined;

  if (!userIdStr) {
    throw new Error("Valid user ID string is required to create an athlete profile");
  }

  // Validate required fields from the form
  if (!data.basicInfo?.firstName || !data.basicInfo?.lastName || !data.basicInfo?.email) {
    throw new Error("First name, last name, and email are required fields");
  }

  // Transform UI form data to a flat structure potentially compatible with NewAthleteProfileType
  const flatData = transformToFlat(data);

  // Add the userId to the payload as a string
  flatData.userId = userIdStr;

  console.log("Creating athlete with data:", flatData);

  // The Hono client ($post) expects the json payload to match the backend route's input schema.
  const response = await client.api.athlete.$post({
    json: flatData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Failed to create athlete profile:", errorData);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to create athlete profile");
  }

  const responseData = await response.json();
  const createdFlatAthlete = responseData.data;

  if (!createdFlatAthlete) {
    throw new Error("No data returned after creating athlete profile");
  }

  // Return the flat data directly as received from the backend without transformation
  return createdFlatAthlete;
};

/**
 * Update an athlete profile
 */
export const updateAthlete = async (
  id: string,
  data: AthleteUpdateFormValues
): Promise<unknown> => {
  const flatData = transformToFlat(data);

  // Cast to any to bypass type checking issues with the Hono client
  // biome-ignore lint/suspicious/noExplicitAny: Necessary to work with the complex Hono client typing
  const putMethod = client.api.athlete[":id"].$put as any;

  const response = await putMethod({
    param: { id },
    json: flatData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to update athlete profile");
  }

  const responseData = await response.json();
  const updatedFlatAthlete = responseData.data;
  if (!updatedFlatAthlete) {
    throw new Error("No data returned after updating athlete profile");
  }
  // Return the flat data directly
  return updatedFlatAthlete;
};

/**
 * Delete an athlete profile
 */
export const deleteAthlete = async (id: string): Promise<{ id: string }> => {
  const response = await client.api.athlete[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    throw new Error("Failed to delete athlete profile");
  }

  const data = await response.json();
  // Assuming the backend returns { data: { id: string } } on successful delete
  const deletedData = data.data as { id?: string } | undefined;
  if (!deletedData?.id) {
    console.warn("Delete response did not contain an ID, returning the requested ID.");
    return { id }; // Fallback to returning the ID that was requested for deletion
  }
  return { id: deletedData.id };
};
