import { useMutation } from "@tanstack/react-query";
import { updateSongListTypes } from "../../api/api";
import { CheckboxGroup } from "../../config/formInterfaces";
import { Song } from "../../config/interfaces";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";

type UpdatePayload = {
  songId: string;
  value: boolean;
  type: CheckboxGroup;
};

export const useUpdateSongListTypes = () => {
  return useMutation({
    mutationFn: updateSongListTypes,

    // OPTIMISTIC UPDATE
    onMutate: async ({ songId, value, type }: UpdatePayload) => {
      await queryClient.cancelQueries({ queryKey: [QUERIES.SONGS_LIST] });

      const previousSongs = queryClient.getQueryData<Song[]>([QUERIES.SONGS_LIST]);

      queryClient.setQueryData<Song[]>([QUERIES.SONGS_LIST], oldSongs => {
        if (!oldSongs) return [];

        return oldSongs.map(song => {
          if (song.songId !== songId) return song;
          return {
            ...song,
            [type]: value,
          };
        });
      });

      return { previousSongs }; // context passed to onError
    },

    // ROLLBACK ON ERROR
    onError: (_err, _variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData([QUERIES.SONGS_LIST], context.previousSongs);
      }
    },

    // INVALIDATE ON SUCCESS OR FAILURE
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
    },
  });
};
