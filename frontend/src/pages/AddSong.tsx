import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import * as uuid from "uuid";
import { getArtistsDb } from "../api/api";
import { AddToggleButtonGroup } from "../components/buttonGroups/AddToggleButtonGroup";
import CheckboxGroup from "../components/buttonGroups/CheckboxGroup";
import PageHeader from "../components/buttonGroups/Header";
import PageWrapper from "../components/PageWrapper";
import { BaseSongFormData, baseSongFormSchema, Option } from "../config/formInterfaces";
import { QUERIES } from "../constants/queries";
import { useAddSong } from "../hooks/useAddSong";
import useAppToast from "../hooks/useAppToast";
import { useFilteredSongOptions } from "../hooks/useFilteredSongOptions";
import { isDataVerified } from "../services/externalApi";
import { getArtistsSelectData, getSongsSelectData } from "../utils/artists";
import { capitalizeArtistNames, capitalizeSongNames } from "../utils/strings";

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
    defaultValues,
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

  const { data: artistsDb, isLoading, isError, error } = useQuery({
    queryKey: [QUERIES.GET_ARTISTS_DB],
    queryFn: getArtistsDb,

  });
  const { options: filteredSongSelectOptions, isLoadingOpenAI } = useFilteredSongOptions({ songOptions: songOptions, artistOptionValue: artistOptionValue });
  const { mutate: addSongMutation, isPending } = useAddSong("list");

  useEffect(() => {
    if (artistsDb?.data) {
      const artist = getArtistsSelectData(artistsDb)
      const songs = getSongsSelectData(artistsDb)

      setArtistOptions(artist)
      setSongOptions(songs)
    }
  }, [artistsDb])

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

    } catch (verificationError) {
      setIsVerifying(false)
      showErrorToast("Verification failed.", "An unexpected error occurred during verification.");
      return;
    }

    const eventData = {
      location: "",
      eventDate: null
    }
    const capitalizedArtistName = capitalizeArtistNames(data.artist)
    const capitalizedSongName = capitalizeSongNames(data.title)
    const songData = { songId: uuid.v4(), events: [eventData], ...data, artist: capitalizedArtistName, title: capitalizedSongName };

    addSongMutation(songData);
  }

  return (
    <PageWrapper>
      <Center><AddToggleButtonGroup /></Center>

      <PageHeader title="Add songs" tooltipLabel="Add songs to your list" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
          <FormControl isInvalid={!!errors.artist} isRequired>
            <FormLabel htmlFor="artist">Artist</FormLabel>
            <CreatableSelect
              placeholder="Type or select an artist"
              isClearable
              options={artistOptions}
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
              isLoading={isLoadingOpenAI}
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
          <Box as="section" pb={4} justifyContent={"center"} display={"flex"} >
            <Alert status="warning" variant="top-accent" flexDirection={"column"} rounded={"md"} maxWidth={"xl"}>
              <AlertIcon />
              <AlertTitle mb={2}> {typoSuggestions.type} could not be verified. Did you mean?</AlertTitle>
              <AlertDescription
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                mx="auto"
              >
                <Stack direction="row" spacing={2} justifyContent={"center"} flexWrap={"wrap"} >
                  {typoSuggestions.data.map((item) => {
                    return <Button key={item} variant="solid" padding={1} size={"xs"} colorScheme="green"
                      onClick={() => {
                        if (typoSuggestions.type === "artist") {
                          setArtistOptionValue({ value: item, label: item })
                          setValue("artist", item)
                        }
                        if (typoSuggestions.type === "song") {
                          setSongOptionValue({ value: item, label: item })
                          setValue("title", item)
                        }
                      }}
                      type="submit"
                    >
                      {item}
                    </Button>
                  })}
                </Stack>
              </AlertDescription>

            </Alert>
          </Box>
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
