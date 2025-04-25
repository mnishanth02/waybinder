import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/auth-api";
import { userKeys } from "./query-keys";

/**
 * Hook to fetch all users
 * @returns Query result with users data, loading and error states
 */
export const useGetUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
