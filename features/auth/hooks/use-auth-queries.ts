import { useQuery } from "@tanstack/react-query";
import { getUserWithAthlete } from "../api/auth-api";
import { userKeys } from "./query-keys";

export const useGetUserWithAthleteByUserId = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserWithAthlete(id),
    enabled: Boolean(id),
  });
};
