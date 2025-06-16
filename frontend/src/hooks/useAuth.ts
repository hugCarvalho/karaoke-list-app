import { useQuery } from "@tanstack/react-query";
import { User } from "src/config/interfaces";
import { getUser } from "../api/api";
import { QUERIES } from "../constants/queries";

interface UseAuthResult {
  user: User | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any; // TODO: define error type
}

export const useAuth = (opts = {}): UseAuthResult => {
  const { data: user, isLoading, isError, error, ...rest } = useQuery<User>({
    queryKey: [QUERIES.GET_USER],
    queryFn: getUser,
    staleTime: Infinity,
    ...opts,
  });
  return {
    user,
    isLoading,
    isError,
    error,
    ...rest,
  };
};
