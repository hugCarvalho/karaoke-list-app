// frontend/src/hooks/useFilteredArtistOptions.tsx
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Option } from "../config/formInterfaces"
import { getArtistsFromAI } from "../services/externalApi"

type UseFilteredArtistOptionsProps = {
  artistOptions: Option[]
  songOptionValue: Option | null | undefined
}

type UseFilteredArtistOptionsReturn = {
  options: Option[]
  isLoadingOpenAI: boolean
  openAIError: Error | null
}

export const useFilteredArtistOptions = ({
  artistOptions = [],
  songOptionValue,
}: UseFilteredArtistOptionsProps): UseFilteredArtistOptionsReturn => {
  const songTitle = songOptionValue?.value

  const {
    data: backendArtistOptions,
    isLoading: isLoadingOpenAI,
    error: openAIError,
  } = useQuery({
    queryKey: ["artists", songTitle],
    queryFn: async () => {
      if (!songTitle) {
        return []
      }
      const artists = await getArtistsFromAI(songTitle)
      return artists.map((artist: string | Option) =>
        typeof artist === "string" ? { value: artist, label: artist } : artist
      )
    },
    enabled: !!songTitle,
    staleTime: Infinity,
    retry: false,
  })

  const filteredAndUniqueOptions = useMemo(() => {
    if (songTitle) {
      const allOptions = backendArtistOptions || []
      const uniqueOptions: Option[] = []
      const seenValues = new Set()

      for (const option of allOptions) {
        if (option?.value && !seenValues.has(option.value)) {
          uniqueOptions.push(option)
          seenValues.add(option.value)
        }
      }

      return uniqueOptions
    }

    return artistOptions || []
  }, [artistOptions, songTitle, backendArtistOptions])

  return {
    options: filteredAndUniqueOptions,
    isLoadingOpenAI,
    openAIError: openAIError as Error | null,
  }
}
