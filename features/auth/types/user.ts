/**
 * Type definitions for user and athlete profile data
 */

/**
 * Basic user information
 */
export interface User {
  id?: string;
  name: string;
  email: string;
  isAdmin?: boolean | null;
  role?: string;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null;
  phone?: string | null;
}

/**
 * Athlete profile information
 */
export interface AthleteProfile {
  id: string;
  firstName: string;
  lastName: string;
  athleteUniqueId: string;
  email: string;
  // Add other athlete profile fields as needed
  dateOfBirth?: string;
  gender?: string;
  displayName?: string;
  profileImageUrl?: string;
  coverPhotoUrl?: string;
  location?: string;
  fitnessLevel?: string;
  bio?: string;
  goals?: string;
}

/**
 * User with athlete profile
 */
export interface UserWithAthleteProfile extends User {
  athleteProfile?: AthleteProfile | null;
}
