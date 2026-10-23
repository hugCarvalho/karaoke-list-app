import { Box, Button, Center, Flex, FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import * as uuid from "uuid";
import { getArtistsDb } from "../api/api";
import { AlertSuggestions } from "../components/AlertSuggestions";
import { AddToggleButtonGroup } from "../components/buttonGroups/AddToggleButtonGroup";
import CheckboxGroup from "../components/buttonGroups/CheckboxGroup";
import PageHeader from "../components/buttonGroups/Header";
import PageWrapper from "../components/PageWrapper";
import { BaseSongFormData, baseSongFormSchema, Option } from "../config/formInterfaces";
import { QUERIES } from "../constants/queries";
import { useAddSong } from "../hooks/useAddSong";
import useAppToast from "../hooks/useAppToast";
import { useFilteredArtistOptions } from "../hooks/useFilteredArtistOptions"; // <-- Import new hook
import { useFilteredSongOptions } from "../hooks/useFilteredSongOptions";
import { isDataVerified } from "../services/externalApi";
import { getArtistsSelectData, getSongsSelectData } from "../utils/artists";
import { capitalizeText } from "../utils/strings";

const defaultValues = {
  title: "",
  artist: "",
  fav: false,
  blacklisted: false,
  inNextEventList: false,
  duet: false,
  notAvailable: false,
  plays: 0
}

const suggestionInitValue = { type: "", data: [] }

const AddSong = () => {
  const { showErrorToast } = useAppToast();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BaseSongFormData>({
    resolver: zodResolver(baseSongFormSchema),
    defaultValues
  });

  const fav = watch("fav");
  const blacklisted = watch("blacklisted");
  const duet = watch("duet");
  const inNextEventList = watch("inNextEventList");
  const notAvailable = watch("notAvailable");

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [typoSuggestions, setTypoSuggestions] = useState(suggestionInitValue);

  //Select Options
  const [artistOptions, setArtistOptions] = useState<Option[]>([]);
  const [songOptions, setSongOptions] = useState<Option[]>([]);
  const [artistOptionValue, setArtistOptionValue] = useState<Option | null>(null);
  const [songOptionValue, setSongOptionValue] = useState<Option | null>();

  const { data: artistsDb } = useQuery({
    queryKey: [QUERIES.GET_ARTISTS_DB],
    queryFn: getArtistsDb,
  });

  // Existing song filtering hook
  const { options: filteredSongSelectOptions, isLoadingOpenAI: isLoadingSongAI, openAIError: songAIError } = useFilteredSongOptions({
    songOptions: songOptions,
    artistOptionValue: artistOptionValue
  });

  // New artist filtering hook (Reverse Lookup)
  const { options: filteredArtistSelectOptions, isLoadingOpenAI: isLoadingArtistAI, openAIError: artistAIError } = useFilteredArtistOptions({
    artistOptions: artistOptions,
    songOptionValue: songOptionValue,
  });

  const { mutate: addSongMutation, isPending } = useAddSong("list");

  useEffect(() => {
    if (artistsDb?.data) {
      const artist = getArtistsSelectData(artistsDb)
      const songs = getSongsSelectData(artistsDb)

      setArtistOptions(artist)
      setSongOptions(songs)
    }
  }, [artistsDb])

  // Handle errors for OpenAI queries via Toast
  useEffect(() => {
    if (songAIError) {
      showErrorToast("AI Fetch Error", songAIError.message);
    }
  }, [songAIError, showErrorToast]);

  useEffect(() => {
    if (artistAIError) {
      showErrorToast("AI Fetch Error", artistAIError.message);
    }
  }, [artistAIError, showErrorToast]);

  const onSubmit = async (data: BaseSongFormData) => {
    setTypoSuggestions(suggestionInitValue)
    setIsVerifying(true)

    try {
      const res = await isDataVerified(data.title, data.artist)
      setIsVerifying(false)

      if (res?.verified === false) {
        if (res.type === "artist") {
          setTypoSuggestions({ type: "artist", data: res.suggestions })
          return
        }
        if (res.type === "song") {
          setTypoSuggestions({ type: "song", data: res.suggestions })
        }
        return
      }

      const capitalizedArtistName = capitalizeText(data.artist)
      const capitalizedSongName = capitalizeText(data.title)

      const songData = {
        ...data,
        songId: uuid.v4(),
        events: [{ location: "", eventDate: null }],
        artist: capitalizedArtistName,
        title: capitalizedSongName,
      };

      addSongMutation(songData);
    } catch {
      setIsVerifying(false);
      showErrorToast("Verification failed.", "An unexpected error occurred during verification.");
    }
  };

  return (
    <PageWrapper>
      <PageHeader title="Add Songs to List" tooltipLabel="Add NEW songs. Either ADD songs for a future reference (play count will be 0) or add SANG songs you've just sang directly to you current event (play count will be 1). If the song already exists, you must add a play using the LIST instead." />
      <Center><AddToggleButtonGroup /></Center>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
          <FormControl isInvalid={!!errors.artist} isRequired>
            <FormLabel htmlFor="artist">Artist</FormLabel>
            <CreatableSelect
              isLoading={isLoadingArtistAI}
              placeholder="Type or select an artist"
              isClearable
              options={filteredArtistSelectOptions} // <-- Use filtered artist options here
              value={artistOptionValue}
              onCreateOption={(e) => {
                setArtistOptions(state => [...state, { value: e, label: e }])
                setArtistOptionValue({ value: e, label: e })
                setValue("artist", e)
              }}
              onChange={(option) => {
                setValue("artist", option?.value || "")
                setArtistOptionValue(option)
              }}
              styles={{
                option: (base, state) => ({
                  ...base,
                  color: state.isSelected ? 'inherit' : 'gray',
                }),
              }}
            />
            {errors.artist && (
              <FormErrorMessage>{errors.artist.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.title} isRequired>
            <FormLabel htmlFor="title">Song</FormLabel>
            <CreatableSelect
              isLoading={isLoadingSongAI}
              placeholder="Type or select a song"
              isClearable
              options={filteredSongSelectOptions}
              value={songOptionValue}
              onCreateOption={(e) => {
                setSongOptions(state => [...state, { value: e, label: e }])
                setSongOptionValue({ value: e, label: e })
                setValue("title", e)
              }}
              onChange={(option) => {
                setValue("title", option?.value || "")
                setSongOptionValue(option)
              }}
              styles={{
                option: (base, state) => ({
                  ...base,
                  color: state.isSelected ? 'inherit' : 'gray',
                }),
              }}
            />
            {errors.title && (
              <FormErrorMessage>{errors.title.message}</FormErrorMessage>
            )}
          </FormControl>
        </Flex>

        <CheckboxGroup
          register={register}
          fav={fav}
          blacklisted={blacklisted}
          inNextEventList={inNextEventList}
          duet={duet}
          notAvailable={notAvailable}
          setValue={setValue}
        />
        {typoSuggestions.data.length > 0 &&
          <AlertSuggestions
            type={typoSuggestions.type as "artist" | "song"}
            suggestions={typoSuggestions.data}
            setValue={setValue}
            setArtistOptionValue={setArtistOptionValue}
            setSongOptionValue={setSongOptionValue}
          />
        }
        <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Button type="submit" colorScheme="blue"
            isLoading={isPending || isVerifying}
            isDisabled={isPending || isVerifying}
            width={"xl"}
          >
            Save
          </Button>
        </Box>
      </form>
    </PageWrapper >
  );
};

export default AddSong;
