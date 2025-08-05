import { useMemo } from 'react';
import { Song } from '../../config/interfaces';
import { ListType } from '../../config/types';

type UseFilteredSongsProps = {
  data: Song[] | undefined;
  songFilterText: string;
  artistFilterText: string;
  listName: ListType;
};

export const useFilteredSongs = ({ data, songFilterText, artistFilterText, listName }: UseFilteredSongsProps): Song[] => {
  const filteredSongs = useMemo(() => {
    if (!data) return [];

    let currentFilteredList = data;

    if (listName === "fav") {
      currentFilteredList = data.filter((song) => song.fav);
    } else if (listName === "blacklist") {
      currentFilteredList = data.filter((song) => song.blacklisted);
    } else if (listName === "duet") {
      currentFilteredList = data.filter((song) => song.duet);
    } else if (listName === "nextEvent") {
      currentFilteredList = data.filter((song) => song.inNextEventList);
    } else if (listName === "notAvailable") {
      currentFilteredList = data.filter((song) => song.notAvailable);
    } else if (listName === "whitelist") {
      currentFilteredList = data.filter((song) => !song.blacklisted);
    } else {
      currentFilteredList = data.filter((song) => !song.notAvailable);
    }

    return currentFilteredList.filter((song) => {
      const matchesSong = song.title.toLowerCase().includes(songFilterText.toLowerCase());
      const matchesArtist = song.artist.toLowerCase().includes(artistFilterText.toLowerCase());
      return matchesSong && matchesArtist;
    });
  }, [data, songFilterText, artistFilterText, listName]);

  return filteredSongs;
};
