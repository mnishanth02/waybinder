import type { AthleteProfileType, UserTypeSelect } from "@/server/db/schema";

interface _User extends UserTypeSelect {}

interface _UserWithAthleteProfile
  extends Pick<UserTypeSelect, "name" | "email" | "isAdmin" | "role"> {
  athleteProfile?: Pick<AthleteProfileType, "firstName" | "lastName" | "athleteUniqueId" | "email">;
}

export type UserType = _User;
export type UserWithAthleteProfileType = _UserWithAthleteProfile;
