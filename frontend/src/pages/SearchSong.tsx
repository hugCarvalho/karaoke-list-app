import { Alert, AlertIcon, Box, Button, Checkbox, FormControl, FormErrorMessage, FormLabel, Grid, Select } from "@chakra-ui/react";
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
  decade: string;
  genre: string;
  mood: string;
  duet: boolean;
  language: string;
};

//TODO: style tooltip and update content

export const SearchSong = () => {
  const { clearErrors, setError, formState: { errors }, register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      decade: "",
      genre: "",
      mood: "",
      duet: false,
      language: "",
    },
  });

  const { data, mutate, isPending } = useMutation({
    mutationFn: getSuggestionsFromOpenAI,
  });

  const onSubmit = (data: FormValues) => {
    const { decade, genre, mood, duet, language } = data
    const areAllFieldsEmpty = !decade && !genre && !mood && !language && duet === false;

    if (areAllFieldsEmpty) {
      setError("root", {
        type: "manual",
        message: "At least one field must be chosen!",
      });
      return;
    };
    clearErrors("root");
    mutate(data);
  }

  return (
    <PageWrapper>
      <PageHeader title="Search For Inspiration" tooltipLabel="Search for songs based on your preferences. If no songs are returned, try selecting fewer filters." />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(2, 1fr)" }}
          gap={4}
          mb={4}
        >
          {/* DECADE INPUT */}
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
          {/*GENRE INPUT */}
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
          {/* LANGUAGE INPUT */}
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
          {/* MOOD INPUT */}
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
        {/* DUET CHECKBOX */}
        <FormControl display="flex" alignItems="center" pb={2}>
          <Checkbox {...register("duet")}>Duet</Checkbox>
        </FormControl>
        {/* //ERROR FORM */}
        {errors?.root && (
          <FormControl isInvalid={true} >
            <FormErrorMessage display="block" mb={2}>
              {errors.root.message}
            </FormErrorMessage>
          </FormControl>
        )}
        {/* SUBMIT BTN */}
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
      {/* SONG SUGGESTIONS LIST - NO SONGS FOUND */}
      {data && data.length === 0 &&
        <Alert status="warning" mt={4} borderRadius="md">
          <AlertIcon />
          No songs found 😨! Try using fewer or different filters.
        </Alert>
      }
      {/* SONG SUGGESTIONS LIST */}
      {data && data.length > 0 && <SongSuggestionsList songs={data} />}
    </PageWrapper>
  );
};
