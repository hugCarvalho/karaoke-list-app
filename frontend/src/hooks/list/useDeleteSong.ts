import { useMutation } from "@tanstack/react-query";
import { deleteSong } from "../../api/api";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";
import useAppToast from "../useAppToast";

export const useDeleteSong = () => {
  const { showErrorToast } = useAppToast();

  return useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error deleting song",
        error?.message || "An error occurred while deleting the song."
      );
    },
  });
};

