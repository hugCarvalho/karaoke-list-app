import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, HStack, Input, Spinner, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import * as uuid from "uuid";
import { addSangSong, getArtistsDb, getEventsList } from "../api/api";
import { AddToggleButtonGroup } from "../components/buttonGroups/AddToggleButtonGroup";
import CheckboxGroup from "../components/buttonGroups/CheckboxGroup";
import PageHeader from "../components/buttonGroups/Header";
import PageWrapper from "../components/PageWrapper";
import { Option, SongsSangFormData, songsSangFormSchema } from "../config/formInterfaces";
import { Artist, Data, KaraokeEvents } from "../config/interfaces";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import { useCloseEvent } from "../hooks/useCloseEvent";
import { useCreateEvent } from "../hooks/useCreateEvent";
import { getSongsFromOpenAI, isDataVerified } from "../services/externalApi";
import { formatToGermanDate } from "../utils/date";
import { capitalizeArtistNames } from "../utils/strings";
import { eventData } from "./mainNavigation/EventsHistory";

const defaultValues = {
  title: "",
  artist: "",
  fav: false,
  blacklisted: false,
  duet: false,
  inNextEventList: false,
  notAvailable: false,
  location: "Monster Ronson",
  eventDate: new Date(),
  plays: 1
}

//TODO: maintain 2 diff routes or add options in add songs to deal with adding new songs or sang songs
const SongsSang = () => {
  const { mutate: createEventMutation, isPending: isCreateEventPending } = useCreateEvent();
  const { mutate: closeEventMutation, isPending: isCloseEventPending } = useCloseEvent();
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<SongsSangFormData>({
    resolver: zodResolver(songsSangFormSchema),
    defaultValues,
  });

  const toast = useToast();
  const fav = watch("fav");
  const blacklisted = watch("blacklisted");
  const duet = watch("duet");
  const inNextEventList = watch("inNextEventList");
  const notAvailable = watch("notAvailable");

  //Select Options
  const [artistOptions, setArtistOptions] = useState<Option[]>([]);
  const [songOptions, setSongOptions] = useState<Option[]>([]);
  const [artistOptionValue, setArtistOptionValue] = useState<Option | null>();
  const [songOptionValue, setSongOptionValue] = useState<Option | null>();
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const { data: artistsDb, error } = useQuery({
    queryKey: [QUERIES.GET_ARTISTS_DB],
    queryFn: getArtistsDb,
  });
  const { data: eventsList, isLoading: isEventsListLoading } = useQuery<Data["events"]>({
    queryKey: [QUERIES.GET_EVENTS_LIST],
    queryFn: getEventsList,
  });
  const { data: backendSongOptions, isLoading: isOpenAILoading } = useQuery({
    queryKey: ['songs', artistOptionValue?.value],
    queryFn: () => artistOptionValue?.value ? getSongsFromOpenAI(artistOptionValue.value) : null,
    enabled: !!artistOptionValue?.value,
    staleTime: Infinity,
  });
  const { mutate: addSongMutation, isPending } = useMutation({
    mutationFn: addSangSong,
    onSuccess: () => {
      toast({
        title: "Song Added.",
        description: "The song has been added to your list.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] })
    },
    onError: (error: any) => {
      toast({
        title: "Error adding song.",
        description: error?.message || "An error occurred while adding the song.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    if (artistsDb?.data) {
      const artist = artistsDb.data.map((artist: Artist) => {
        return { value: artist.name, label: artist.name }
      }) ?? []
      const songs = artistsDb.data.reduce((acc: Artist[], artist: Artist) => {
        const songLabels = artist.songs.map(song => ({ value: song, label: song }));
        return [...acc, ...songLabels];
      }, []) ?? []
      setArtistOptions(artist)
      setSongOptions(songs)
    }
  }, [artistsDb])

  const onSubmit = async (data: SongsSangFormData) => {
    setIsVerifying(true)
    try {
      const res = await isDataVerified(data.title, data.artist)
      setIsVerifying(false)
      if (res?.verified === false) {
        toast({
          title: "Error verifying song data.",
          description: error?.message || "Artist and song mismatch or typo present, please check data entered.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return
      }
    } catch (error) {
      setIsVerifying(false)
    }

    const eventData = {
      location: data.location,
      eventDate: data.eventDate
    }
    const capitalizedArtistName = capitalizeArtistNames(data.artist)
    const songData = { songId: uuid.v4(), events: [eventData], ...data, artist: capitalizedArtistName };
    addSongMutation(songData);
  };

  const isEventOpen = eventsList?.some((e: KaraokeEvents) => !e.closed) ?? false;

  const filterOptionsByArtist = () => {
    const filteredOptionsByArtist = songOptions.filter(song => song.artist === artistOptionValue?.value)
    if (backendSongOptions) {
      const allOptions = [...filteredOptionsByArtist, ...backendSongOptions];
      const uniqueOptions = [];
      const seenValues = new Set();

      for (const option of allOptions) {
        if (!seenValues.has(option.value)) {
          uniqueOptions.push(option);
          seenValues.add(option.value);
        }
      }
      return uniqueOptions;
    }
    return filteredOptionsByArtist
  };

  return (
    <PageWrapper>
      <Center><AddToggleButtonGroup /></Center>
      <Center mb={4}>
        <PageHeader
          title="Songs Sang"
          //TODO: tooltip format
          tooltipLabel="1- Open an event. 2-Add new songs that have you sung 3-If song already exists, use lists instead 4- This will appear in the history 5- There can be only one event open at the same time."
        />
      </Center>
      {isEventsListLoading ? <Center>
        <Spinner />
      </Center> : <>
      </>
      }
      {
        !isEventsListLoading && !isEventOpen && <>
          <div>
            <p>{!isEventsListLoading && "You have no events open. Create one?"}</p>
            <Button onClick={() => createEventMutation(eventData)}>Create event</Button>
          </div>
        </>
      }
      {
        !isEventsListLoading && isEventOpen && <><form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
            {/* BTN mobile only */}
            <Button
              display={{ base: "block", md: "none" }}
              isLoading={isCloseEventPending}
              isDisabled={isCloseEventPending}
              onClick={() => closeEventMutation()}
              variant={"secondary"}
            >
              Close Event
            </Button>
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
                isLoading={isOpenAILoading}
                placeholder="Type or select a song"
                isClearable
                options={artistOptionValue ? filterOptionsByArtist() : songOptions}
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

          <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
            <FormControl isInvalid={!!errors.location}>
              <FormLabel>Location</FormLabel>
              <Input {...register("location")} placeholder="Location" />
              {errors.location && (
                <FormErrorMessage>{errors.location.message}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Event Date</FormLabel>
              <Input value={formatToGermanDate(new Date().toString())} isDisabled />
            </FormControl>
          </Flex>

          <CheckboxGroup
            duet={duet}
            register={register}
            fav={fav}
            blacklisted={blacklisted}
            inNextEventList={inNextEventList}
            notAvailable={notAvailable}
            setValue={setValue}
          />

          <HStack>
            <Button w={"100%"} type="submit" colorScheme="blue" isLoading={isPending || isVerifying} isDisabled={isPending || isVerifying}>
              Save
            </Button>
            {/* BTN mobile only */}
            <Button
              w={"20%"}
              display={{ base: "none", md: "block" }}
              isLoading={isCloseEventPending}
              isDisabled={isCloseEventPending}
              onClick={() => closeEventMutation()}
              variant={"secondary"}
            >
              Close Event
            </Button>
          </HStack>
        </form>

        </>
      }
    </PageWrapper>
  );
};

export default SongsSang;
