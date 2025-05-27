import { useMutation } from "@tanstack/react-query";
import { deleteSong } from "../../api/api";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";

export const useDeleteSong = () => {

  return useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
    },
  });
};

