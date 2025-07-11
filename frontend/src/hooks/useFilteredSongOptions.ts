import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Option } from '../config/formInterfaces';
import { getSongsFromOpenAI } from '../services/externalApi';

type UseFilteredSongOptionsProps = {
  songOptions: Option[];
  artistOptionValue: Option | null;
};

type UseFilteredSongOptionsReturn = {
  options: Option[];
  isLoadingOpenAI: boolean;
};

export const useFilteredSongOptions = ({
  songOptions,
  artistOptionValue,
}: UseFilteredSongOptionsProps): UseFilteredSongOptionsReturn => {

  const { data: backendSongOptions, isLoading: isLoadingOpenAI } = useQuery<Option[]>({
    queryKey: ['songs', artistOptionValue?.value],
    queryFn: async () => {
      if (!artistOptionValue?.value) {
        return [];
      }
      return getSongsFromOpenAI(artistOptionValue.value);
    },
    enabled: !!artistOptionValue?.value,
    staleTime: Infinity,
  });

  const filteredAndUniqueOptions = useMemo(() => {
    const filteredFromDb = songOptions.filter(song => song.artist === artistOptionValue?.value);

    let allOptions = [...filteredFromDb];
    if (backendSongOptions) {
      allOptions = [...allOptions, ...backendSongOptions];
    }

    const uniqueOptions: Option[] = [];
    const seenValues = new Set();

    for (const option of allOptions) {
      if (!seenValues.has(option.value)) {
        uniqueOptions.push(option);
        seenValues.add(option.value);
      }
    }

    return uniqueOptions;
  }, [songOptions, artistOptionValue, backendSongOptions]);

  return {
    options: filteredAndUniqueOptions,
    isLoadingOpenAI: isLoadingOpenAI,
  };
};
