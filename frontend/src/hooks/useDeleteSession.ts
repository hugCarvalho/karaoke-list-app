import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSession, Session } from "../api/api.js";
import { SESSIONS } from "./useSessions.js";

const useDeleteSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { mutate, ...rest } = useMutation({
    mutationFn: () => deleteSession(sessionId),
    onSuccess: () => {
      queryClient.setQueryData([SESSIONS], (cache: Session[]) =>
        cache.filter((session: Session) => session._id !== sessionId)
      );
    },
  });

  return { deleteSession: mutate, ...rest };
};

export default useDeleteSession;
