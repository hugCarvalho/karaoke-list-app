import { useMutation } from "@tanstack/react-query";
import { addSong } from "../api/api";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import useAppToast from "./useAppToast";

export const useAddSong = () => {
  const { showSuccessToast, showErrorToast } = useAppToast();

  return useMutation({
    mutationFn: addSong,
    onSuccess: () => {
      showSuccessToast("Song added.", "The song has been added to your list.");
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error adding song.",
        error?.message || "An error occurred while adding the song."
      );
    },
  });
};

