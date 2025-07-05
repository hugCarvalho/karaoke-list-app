// src/hooks/list/useUpdatePlayCount.ts
import { useMutation } from "@tanstack/react-query";
import { updatePlayCount as apiUpdatePlayCount } from "../../api/api";
import { Song } from "../../config/interfaces";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";
import useAppToast from "../useAppToast";

interface UpdatePlayCountMutationVariables {
  songId: string;
  artist: string;
  title: string;
}

export const useUpdatePlayCount = () => {
  const { showSuccessToast, showErrorToast } = useAppToast();

  return useMutation({
    mutationFn: apiUpdatePlayCount,

    // --- Optimistically update SONGS_LIST ---
    onMutate: async (updatedSongData: UpdatePlayCountMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: [QUERIES.SONGS_LIST] });

      const previousSongsList = queryClient.getQueryData<Song[]>([QUERIES.SONGS_LIST]);

      queryClient.setQueryData<Song[]>([QUERIES.SONGS_LIST], (oldSongsList) => {
        if (!oldSongsList) return oldSongsList;

        return oldSongsList.map((song) => {
          if (song.songId === updatedSongData.songId) {
            return {
              ...song,
              plays: (song.plays || 0) + 1,
              events: [
                ...(song.events || []),
                {
                  location: 'Monster Ronson',
                  eventDate: new Date().toISOString(),
                },
              ],
            };
          }
          return song;
        });
      });

      return { previousSongsList };
    },

    onError: (error: Error, updatedSongData: UpdatePlayCountMutationVariables, context) => {
      showErrorToast(
        "Error updating play count",
        error?.message || "An error occurred while increasing play count."
      );

      // Rollback only the SONGS_LIST cached query if the mutation fails
      if (context?.previousSongsList) {
        queryClient.setQueryData([QUERIES.SONGS_LIST], context.previousSongsList);
      }
    },
    onSuccess: () => {
      showSuccessToast("Play count updated", "The song's play count has been increased.");
    },
    onSettled: () => {
      // After the mutation (success or failure), invalidate both relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    }
  });
};
