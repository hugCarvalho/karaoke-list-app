import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Select
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import PageWrapper from "../components/PageWrapper";

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

const searchSongs = async (filters: any) => {
  return new Promise((resolve) => setTimeout(() => resolve(filters), 1000));
};

export const SearchSong = () => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      decade: undefined,
      genre: undefined,
      mood: undefined,
      duet: false,
      language: undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: searchSongs,
    onSuccess: (data) => {
      console.log("Search result:", data);
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('%c SearchSong.tsx - line: 55 -->', 'color: white; background-color: #007acc', data, '<-data')
    //mutate(data);
  };

  return (
    <PageWrapper>
      <Heading size="md" mb={6} textAlign={"center"}>Search Songs</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          templateColumns={{ base: "repeat(3, 1fr)", md: "repeat(2, 1fr)" }}
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
        <FormControl display="flex" alignItems="center">
          <Checkbox {...register("duet")}>Duet</Checkbox>
        </FormControl>

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
    </PageWrapper>
  );
};
