import { useMutation } from "@tanstack/react-query";
import { updatePlayCount } from "../../api/api";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";
import useAppToast from "../useAppToast";

export const useUpdatePlayCount = () => {
  const { showSuccessToast, showErrorToast } = useAppToast();

  return useMutation({
    mutationFn: updatePlayCount,
    onSuccess: () => {
      showSuccessToast("Song updated", "The song has been updated.")
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error updating song",
        error?.message || "An error occurred while updating the song."
      );
    },
  });
};

