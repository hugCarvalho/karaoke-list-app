import { useQuery } from "@tanstack/react-query";
import { getSessions, Session } from "../api/api";

export const SESSIONS = "sessions";

const useSessions = (opts = {}) => {
  const { data, ...rest } = useQuery<{ data: Session[] }>({
    queryKey: [SESSIONS],
    queryFn: getSessions,
    ...opts,
  });

  const sessions = data || [];
  return { sessions, ...rest };
};

export default useSessions;
