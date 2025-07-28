import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import * as uuid from "uuid";
import { getArtistsDb, getEventsList } from "../api/api";
import { AlertSuggestions } from "../components/AlertSuggestions";
import { AddToggleButtonGroup } from "../components/buttonGroups/AddToggleButtonGroup";
import CheckboxGroup from "../components/buttonGroups/CheckboxGroup";
import PageHeader from "../components/buttonGroups/Header";
import PageWrapper from "../components/PageWrapper";
import { BaseSongFormData, baseSongFormSchema, Option } from "../config/formInterfaces";
import { Data, KaraokeEvents } from "../config/interfaces";
import { QUERIES } from "../constants/queries";
import { useAddSong } from "../hooks/useAddSong";
import useAppToast from "../hooks/useAppToast";
import { useCloseEvent } from "../hooks/useCloseEvent";
import { useFilteredSongOptions } from "../hooks/useFilteredSongOptions";
import { isDataVerified } from "../services/externalApi";
import { getArtistsSelectData, getSongsSelectData } from "../utils/artists";
import { capitalizeArtistNames } from "../utils/strings";

const defaultValues = {
  title: "",
  artist: "",
  fav: false,
  blacklisted: false,
  duet: false,
  inNextEventList: false,
  notAvailable: false,
  eventDate: new Date(),
  plays: 1
}
const suggestionInitValue = { type: "", data: [] }

const SongsSang = () => {
  const { showErrorToast } = useAppToast();
  const { mutate: closeEventMutation, isPending: isCloseEventPending } = useCloseEvent();
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<BaseSongFormData>({
    resolver: zodResolver(baseSongFormSchema),
    defaultValues,
  });

  const navigate = useNavigate();
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

  const { data: artistsDb, error } = useQuery({
    queryKey: [QUERIES.GET_ARTISTS_DB],
    queryFn: getArtistsDb,
  });
  const { data: eventsList, isLoading: isEventsListLoading, isRefetching: isEventsListRefetching } = useQuery<Data["events"]>({
    queryKey: [QUERIES.GET_EVENTS_LIST],
    queryFn: getEventsList,
  });
  const { mutate: addSongMutation, isPending } = useAddSong("event");
  const { options: filteredSongSelectOptions, isLoadingOpenAI } = useFilteredSongOptions({ songOptions: songOptions, artistOptionValue: artistOptionValue });

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

    const capitalizedArtistName = capitalizeArtistNames(data.artist)
    const songData = { songId: uuid.v4(), ...data, artist: capitalizedArtistName };
    addSongMutation(songData);
  };

  const isEventOpen = eventsList?.some((e: KaraokeEvents) => !e.closed) ?? false;
  const showSpinner = isEventsListLoading || (!isEventOpen && isEventsListRefetching)

  return (
    <PageWrapper>
      <PageHeader
        title="Songs Sang"
        //TODO: tooltip format
        tooltipLabel="1- Open an event. 2-Add new songs that have you sung 3-If song already exists, use lists instead 4- This will appear in the history 5- There can be only one event open at the same time."
      />
      <Center><AddToggleButtonGroup /></Center>
      {showSpinner &&
        <Center>
          <Spinner />
        </Center>
      }
      {!isEventOpen && !isEventsListRefetching &&
        <VStack spacing={4} align="center" mb={8}>
          <Text fontSize="lg">{!isEventOpen && "You have no events open. Create one?"}</Text>
          <Button
            onClick={() => navigate("/history")}
          >
            Create Event
          </Button>
        </VStack>
      }
      {//FORM
        isEventOpen && <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
            {/* ARTIST INPUT*/}
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
            {/* SONG TITLE INPUT */}
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
          {/* CHECKBOXES GROUP */}
          <CheckboxGroup
            duet={duet}
            register={register}
            fav={fav}
            blacklisted={blacklisted}
            inNextEventList={inNextEventList}
            notAvailable={notAvailable}
            setValue={setValue}
          />
          {/* ARTIST OR SONG SUGGESTIONS */}
          {typoSuggestions.data.length > 0 &&
            <AlertSuggestions
              type={typoSuggestions.type as "artist" | "song"}
              suggestions={typoSuggestions.data}
              setValue={setValue}
              setArtistOptionValue={setArtistOptionValue}
              setSongOptionValue={setSongOptionValue}
            />
          }
          {/* ACTION BTNS */}
          <HStack>
            <Button flex={1} type="submit" colorScheme="blue"
              isLoading={isPending || isVerifying}
              isDisabled={isPending || isVerifying || isCloseEventPending || isEventsListRefetching}
            >
              Save
            </Button>
            <Button
              w={{ base: "auto", md: "20%" }}
              p={{ base: 1, md: undefined }}
              fontSize={{ base: "xs", md: "md" }}
              isLoading={isCloseEventPending}
              isDisabled={isPending || isCloseEventPending || isEventsListRefetching}
              onClick={() => closeEventMutation()}
              variant={"secondary"}
            >
              Close Event
            </Button>
          </HStack>
        </form>
      }
    </PageWrapper>
  );
};

export default SongsSang;
