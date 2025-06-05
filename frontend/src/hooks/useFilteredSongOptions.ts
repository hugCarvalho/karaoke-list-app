// src/hooks/list/useFilteredSongOptions.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Option } from '../config/formInterfaces';
import { getSongsFromOpenAI } from '../services/externalApi';


type UseFilteredSongOptionsProps = {
  songOptions: Option[]; // All songs from your DB (initial data)
  artistOptionValue: Option | null; // The currently selected artist option
};

// Define the return type of the hook
type UseFilteredSongOptionsReturn = {
  options: Option[];
  isLoadingOpenAI: boolean; // <-- Added: to indicate if OpenAI data is loading
};

export const useFilteredSongOptions = ({
  songOptions,
  artistOptionValue,
}: UseFilteredSongOptionsProps): UseFilteredSongOptionsReturn => { // <-- Updated return type

  // Fetch songs from OpenAI based on the selected artist
  // We destructure isLoading as isLoadingOpenAI here
  const { data: backendSongOptions, isLoading: isLoadingOpenAI } = useQuery<Option[]>({
    queryKey: ['songs', artistOptionValue?.value],
    queryFn: async () => {
      if (!artistOptionValue?.value) {
        // This case should ideally not be hit due to `enabled`,
        // but for type safety, return an empty array or throw an error.
        return [];
      }
      return getSongsFromOpenAI(artistOptionValue.value);
    },
    enabled: !!artistOptionValue?.value,
    staleTime: Infinity,
  });

  const filteredAndUniqueOptions = useMemo(() => {
    // 1. Filter songs from your DB by the selected artist
    const filteredFromDb = songOptions.filter(song => song.artist === artistOptionValue?.value);

    // 2. Combine with songs from OpenAI if available
    let allOptions = [...filteredFromDb];
    if (backendSongOptions) {
      allOptions = [...allOptions, ...backendSongOptions];
    }

    // 3. Create unique options based on 'value' (song title)
    const uniqueOptions: Option[] = [];
    const seenValues = new Set();

    for (const option of allOptions) {
      if (!seenValues.has(option.value)) {
        uniqueOptions.push(option);
        seenValues.add(option.value);
      }
    }

    return uniqueOptions;
  }, [songOptions, artistOptionValue, backendSongOptions]); // Dependencies for useMemo

  return {
    options: filteredAndUniqueOptions,
    isLoadingOpenAI: isLoadingOpenAI, // <-- Return the loading state
  };
};
