import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, Heading, IconButton, Input, Tooltip, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import * as uuid from "uuid";
import { addSong, getArtistsDb } from "../api/api";
import CheckboxGroup from "../components/CheckboxGroup";
import PageWrapper from "../components/PageWrapper";
import { Option, SongsSangFormData, songsSangFormSchema } from "../config/formInterfaces";
import { Artist } from "../config/interfaces";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import { formatToGermanDate } from "../utils/date";

const defaultValues = {
  title: "",
  artist: "",
  fav: false,
  blacklisted: false,
  duet: false,
  inNextEventList: false,
  location: "Monster Ronson",
  eventDate: new Date(),
  plays: 1
}

const SongsSang = () => {
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<SongsSangFormData>({
    resolver: zodResolver(songsSangFormSchema),
    defaultValues,
  });
  const toast = useToast();
  const fav = watch("fav");
  const blacklisted = watch("blacklisted");
  const duet = watch("duet");
  const inNextEventList = watch("inNextEventList");

  //Select Options
  const [artistOptions, setArtistOptions] = useState<Option[]>([]);
  const [songOptions, setSongOptions] = useState<Option[]>([]);
  const [artistOptionValue, setArtistOptionValue] = useState<Option | null>();
  const [songOptionValue, setSongOptionValue] = useState<Option | null>();

  const { data: artistsDb, isLoading, isError, error } = useQuery({
    queryKey: [QUERIES.GET_ARTISTS_DB],
    queryFn: getArtistsDb,
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

  const onSubmit = (data: SongsSangFormData) => {
    const eventData = {
      location: data.location,
      eventDate: data.eventDate
    }
    const songData = { songId: uuid.v4(), events: [eventData], ...data };
    addSongMutation(songData);
  };

  return (
    <PageWrapper>
      <Center mb={4}>
        <Heading size="lg">Songs Sang</Heading>
        <Tooltip label="Add songs that have been sung">
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
              placeholder="Type or select a song"
              isClearable
              options={songOptions}
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
            <Input value={formatToGermanDate(new Date())} isDisabled />
          </FormControl>
        </Flex>

        <CheckboxGroup
          duet={duet}
          register={register}
          fav={fav}
          blacklisted={blacklisted}
          inNextEventList={inNextEventList}
          setValue={setValue}
        />

        <Button type="submit" colorScheme="blue" isLoading={isPending}>
          Save
        </Button>
      </form>
    </PageWrapper>
  );
};

export default SongsSang;
