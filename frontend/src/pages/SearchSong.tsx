import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Select, Text
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import PageWrapper from "../components/PageWrapper";
import SongSuggestionsList from "../components/SongSuggestionsList";
import PageHeader from "../components/buttonGroups/Header";
import { getSuggestionsFromOpenAI } from "../services/externalApi";

const decades = [
  { label: "30's", value: "decade 1930" },
  { label: "40's", value: "decade 1940" },
  { label: "50's", value: "decade 1950" },
  { label: "60's", value: "decade 1960" },
  { label: "70's", value: "decade 1970" },
  { label: "80's", value: "decade 1980" },
  { label: "90's", value: "decade 1990" },
  { label: "2000", value: "decade 2000" },
  { label: "2010", value: "decade 2010" },
  { label: "2020", value: "decade 2020" },
]
const genres = [
  { label: "Pop", value: "pop" },
  { label: "Rock", value: "rock" },
  { label: "Hip Hop", value: "hipHop" },
  { label: "Country", value: "country" },
  { label: "Folk", value: "folk" },
  { label: "Reggae", value: "reggae" },
  { label: "Heavy Metal", value: "heavyMetal" },
]

const language = [
  { label: "German", value: "german" },
  { label: "Spanish", value: "spanish" },
  { label: "French", value: "french" },
  { label: "Portuguese", value: "portuguese" },
  { label: "Italian", value: "italian" },
  { label: "English", value: "english" },
]

const moods = [
  { label: "Happy", value: "happy" },
  { label: "Angry", value: "angry" },
  { label: "Melancholic", value: "melancholic" },
]

type FormValues = {
  decade?: string;
  genre?: string;
  mood?: string;
  duet: boolean;
  language?: string;
};

const MOCK = [
  {
    "artist": "Nirvana",
    "title": "Smells Like Teen Spirit",
    "year": 1991
  },
  {
    "artist": "TLC",
    "title": "No Scrubs",
    "year": 1999
  },
  {
    "artist": "Britney Spears",
    "title": "...Baby One More Time",
    "year": 1998
  },
  {
    "artist": "Backstreet Boys",
    "title": "I Want It That Way",
    "year": 1999
  },
  {
    "artist": "Alanis Morissette",
    "title": "You Oughta Know",
    "year": 1995
  },
  {
    "artist": "R.E.M.",
    "title": "Losing My Religion",
    "year": 1991
  },
  {
    "artist": "Spice Girls",
    "title": "Wannabe",
    "year": 1996
  },
  {
    "artist": "Whitney Houston",
    "title": "I Will Always Love You",
    "year": 1992
  },
  {
    "artist": "Pearl Jam",
    "title": "Alive",
    "year": 1991
  },
  {
    "artist": "Mariah Carey",
    "title": "Fantasy",
    "year": 1995
  }
]

export const SearchSong = () => {
  const { clearErrors, setError, formState: { errors }, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      decade: undefined,
      genre: undefined,
      mood: undefined,
      duet: false,
      language: undefined,
    },
  });

  const { data, mutate, isPending } = useMutation({
    mutationFn: getSuggestionsFromOpenAI,
    onSuccess: (data) => {
      console.log("Search result:", data);
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('%c SearchSong.tsx - line: 81', 'color: white; background-color: #00cc29', data, '<-data')
    const { decade, genre, mood, duet, language } = data
    const isAllEmpty = !decade && !genre && !mood && !language && duet === false;
    // console.log('%c SearchSong.tsx - line: 86', 'color: white; background-color: #00cc29', isAllEmpty, '<-isAllEmpty')
    if (isAllEmpty) {
      setError("root", {
        type: "manual",
        message: "At least one field must be chosen!",
      });
      return;
    };
    clearErrors("root");
    mutate(data);
  }
  console.log('%c SearchSong.tsx - line: 149', 'color: white; background-color: #000000', data, '<-data')
  return (
    <PageWrapper>
      <PageHeader title="Search For Inspiration" tooltipLabel="Search for songs based on your preferences" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(2, 1fr)" }}
          gap={4}
          mb={4}
        >
          <FormControl>
            <FormLabel>Decade</FormLabel>
            <Select placeholder="Select decade" {...register("decade")}>
              {decades.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Genre</FormLabel>
            <Select placeholder="Select genre" {...register("genre")}>
              {genres.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Language</FormLabel>
            <Select placeholder="Select language" {...register("language")}>
              {language.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Mood</FormLabel>
            <Select placeholder="Select mood" {...register("mood")}>
              {moods.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>

        </Grid>
        <FormControl display="flex" alignItems="center" pb={2}>
          <Checkbox {...register("duet")}>Duet</Checkbox>
        </FormControl>
        {/* //ERROR FORM */}
        {errors?.root && (
          <FormControl isInvalid={true} >
            <FormErrorMessage display="block" mb={2}> {/* Use display="block" to ensure visibility if not associated with a specific input */}
              {errors.root.message}
            </FormErrorMessage>
          </FormControl>
        )}

        <Box>
          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={isPending}
            isLoading={isPending}
          >
            Search
          </Button>
        </Box>
      </form>

      {data && data.length === 0 && <Text>No songs found. Try to use less filters</Text>}
      {data && data.length > 0 && <SongSuggestionsList songs={data} />}
    </PageWrapper>
  );
};
