import { z } from "zod";

// Basic Info Schema
export const basicInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  dateOfBirth: z.date({ invalid_type_error: "Invalid date format" }).optional(),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"], {
    required_error: "Please select a gender",
  }),
  displayName: z.string().optional(),
  profileImage: z.any().optional(),
  coverPhoto: z.any().optional(),
  location: z.string().optional(),
  profileImageUrl: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
});

// Sports & Activity Schema
export const sportsActivitySchema = z.object({
  primaryActivity1: z.object({
    activity: z.string({ required_error: "Please select a primary activity" }),
    experienceLevel: z.enum(["beginner", "intermediate", "advanced", "professional"], {
      required_error: "Please select an experience level",
    }),
  }),
  primaryActivity2: z
    .object({
      activity: z.string(),
      experienceLevel: z.enum(["beginner", "intermediate", "advanced", "professional"]),
    })
    .optional(),
  primaryActivity3: z
    .object({
      activity: z.string(),
      experienceLevel: z.enum(["beginner", "intermediate", "advanced", "professional"]),
    })
    .optional(),
  secondaryActivities: z.array(z.string()).optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select a fitness level",
  }),
  height: z
    .object({
      value: z.number(),
      unit: z.enum(["cm", "feet"]),
    })
    .optional(),
  weight: z
    .object({
      value: z.number(),
      unit: z.enum(["kg", "lbs"]),
    })
    .optional(),
});

// Additional Information Schema
export const additionalInfoSchema = z.object({
  bio: z.string().optional(),
  goals: z.string().optional(),
  sponsors: z.string().optional(),
  websiteURLs: z.array(z.string().url({ message: "Please enter a valid URL" })).optional(),
  stravaLinks: z.array(z.string().url({ message: "Please enter a valid URL" })).optional(),
  instagramLinks: z.array(z.string().url({ message: "Please enter a valid URL" })).optional(),
  facebookLinks: z.array(z.string().url({ message: "Please enter a valid URL" })).optional(),
  twitterLinks: z.array(z.string().url({ message: "Please enter a valid URL" })).optional(),
  otherSocialLinks: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url({ message: "Please enter a valid URL" }),
      })
    )
    .optional(),
  youtubeURLs: z.array(z.string().url({ message: "Please enter a valid URL" })).optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      phoneNumber: z.string(),
      relationship: z.string(),
    })
    .optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"]).optional(),
  privacySettings: z.record(z.boolean()).optional(),
  communicationPreferences: z.record(z.boolean()).optional(),
});

// Combined Athlete Onboarding Schema
export const athleteOnboardingSchema = z.object({
  basicInfo: basicInfoSchema,
  sportsActivity: sportsActivitySchema,
  additionalInfo: additionalInfoSchema,
});

// Step schemas using zod.pick for modular forms
export const basicInfoStepSchema = basicInfoSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  dateOfBirth: true,
  gender: true,
  displayName: true,
  profileImage: true,
  coverPhoto: true,
  location: true,
  profileImageUrl: true,
  coverPhotoUrl: true,
});

export const sportsActivityStepSchema = sportsActivitySchema.pick({
  primaryActivity1: true,
  primaryActivity2: true,
  primaryActivity3: true,
  secondaryActivities: true,
  fitnessLevel: true,
  height: true,
  weight: true,
});

export const additionalInfoStepSchema = additionalInfoSchema.pick({
  bio: true,
  goals: true,
  sponsors: true,
  websiteURLs: true,
  stravaLinks: true,
  instagramLinks: true,
  facebookLinks: true,
  twitterLinks: true,
  otherSocialLinks: true,
  youtubeURLs: true,
  emergencyContact: true,
  allergies: true,
  medicalConditions: true,
  medications: true,
  bloodGroup: true,
  privacySettings: true,
  communicationPreferences: true,
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type SportsActivityFormValues = z.infer<typeof sportsActivitySchema>;
export type AdditionalInfoFormValues = z.infer<typeof additionalInfoSchema>;
export type AthleteOnboardingFormValues = z.infer<typeof athleteOnboardingSchema>;
export type BasicInfoStepFormValues = z.infer<typeof basicInfoStepSchema>;
export type SportsActivityStepFormValues = z.infer<typeof sportsActivityStepSchema>;
export type AdditionalInfoStepFormValues = z.infer<typeof additionalInfoStepSchema>;
