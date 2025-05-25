import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, Heading, IconButton, Tooltip, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import * as uuid from "uuid";
import { addSong, getArtistsDb } from "../api/api";
import { AddToggleButtonGroup } from "../components/buttonGroups/AddToggleButtonGroup";
import CheckboxGroup from "../components/buttonGroups/CheckboxGroup";
import PageWrapper from "../components/PageWrapper";
import { BaseSongFormData, baseSongFormSchema, Option } from "../config/formInterfaces";
import { Artist } from "../config/interfaces";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import { getSongsFromOpenAI, isDataVerified } from "../services/externalApi";
import { capitalizeArtistNames } from "../utils/strings";

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

const AddSong = () => {
  const { getValues, register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<BaseSongFormData>({
    resolver: zodResolver(baseSongFormSchema),
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

  const { data: artistsDb, isLoading, isError, error } = useQuery({
    queryKey: [QUERIES.GET_ARTISTS_DB],
    queryFn: getArtistsDb,
  });
  const { data: backendSongOptions, isLoading: isOpenAILoading } = useQuery({
    queryKey: ['songs', artistOptionValue?.value],
    queryFn: () => artistOptionValue?.value ? getSongsFromOpenAI(artistOptionValue.value) : null,
    enabled: !!artistOptionValue?.value,
    staleTime: Infinity,
  });
  const { mutate: addSongMutation, isPending } = useMutation({
    mutationFn: addSong,
    onSuccess: () => {
      toast({
        title: "Song Added.",
        description: "The song has been added to your list.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
        const songLabels = artist.songs.map(song => ({ value: song, label: song, artist: artist.name }));
        return [...acc, ...songLabels];
      }, []) ?? []
      setArtistOptions(artist)
      setSongOptions(songs)
    }
  }, [artistsDb])

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

  const onSubmit = async (data: BaseSongFormData) => {
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
      location: "",
      eventDate: null
    }
    const capitalizedArtistName = capitalizeArtistNames(data.artist)
    const songData = { songId: uuid.v4(), events: [eventData], ...data, artist: capitalizedArtistName };
    addSongMutation(songData);
  }

  return (
    <PageWrapper>
      <Center><AddToggleButtonGroup /></Center>
      <Center mb={4}>
        <Heading size="lg">Add songs</Heading>
        <Tooltip label="Add songs to your list">
          <IconButton
            aria-label="Info"
            icon={<InfoOutlineIcon />}
            size="sm"
            ml={2}
            variant="ghost"
          />
        </Tooltip>
      </Center>

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

        <CheckboxGroup
          register={register}
          fav={fav}
          blacklisted={blacklisted}
          inNextEventList={inNextEventList}
          duet={duet}
          notAvailable={notAvailable}
          setValue={setValue}
        />

        <Button type="submit" colorScheme="blue" isLoading={isPending || isVerifying} isDisabled={isPending || isVerifying}>
          Save
        </Button>
      </form>
    </PageWrapper>
  );
};

export default AddSong;
