import { useMutation } from "@tanstack/react-query";
import { updateSongListTypes } from "../../api/api";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";

export const useUpdateSongListTypes = () => {

  return useMutation({
    mutationFn: updateSongListTypes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
    },
  });
};

