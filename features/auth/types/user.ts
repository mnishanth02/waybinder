import type { AthleteProfileType, UserTypeSelect } from "@/server/db/schema";

export interface User extends UserTypeSelect {}

export interface UserWithAthleteProfile
  extends Pick<UserTypeSelect, "name" | "email" | "isAdmin" | "role"> {
  athleteProfile?: Pick<AthleteProfileType, "firstName" | "lastName" | "athleteUniqueId" | "email">;
}
