import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
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
import { Artist } from "../config/interfaces";
import { QUERIES } from "../constants/queries";
import { useAddSong } from "../hooks/useAddSong";
import useAppToast from "../hooks/useAppToast";
import { useFilteredSongOptions } from "../hooks/useFilteredSongOptions";
import { isDataVerified } from "../services/externalApi";
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

const AddSong = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BaseSongFormData>({
    resolver: zodResolver(baseSongFormSchema),
    defaultValues,
  });
  const { showErrorToast } = useAppToast();

  const fav = watch("fav");
  const blacklisted = watch("blacklisted");
  const duet = watch("duet");
  const inNextEventList = watch("inNextEventList");
  const notAvailable = watch("notAvailable");

  //Select Options
  const [artistOptions, setArtistOptions] = useState<Option[]>([]);
  const [songOptions, setSongOptions] = useState<Option[]>([]);
  const [artistOptionValue, setArtistOptionValue] = useState<Option | null>(null);
  const [songOptionValue, setSongOptionValue] = useState<Option | null>();
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const { data: artistsDb, isLoading, isError, error } = useQuery({
    queryKey: [QUERIES.GET_ARTISTS_DB],
    queryFn: getArtistsDb,

  });
  const { options: filteredSongSelectOptions, isLoadingOpenAI } = useFilteredSongOptions({ songOptions: songOptions, artistOptionValue: artistOptionValue });
  const { mutate: addSongMutation, isPending } = useAddSong();


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

  const onSubmit = async (data: BaseSongFormData) => {
    setIsVerifying(true)
    try {
      const res = await isDataVerified(data.title, data.artist)
      setIsVerifying(false)
      if (res?.verified === false) {
        showErrorToast("Error verifying song data.", "Artist and song mismatch or typo present, please check data entered.");
        return
      }
    } catch (verificationError: any) {
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
  console.log('%c AddSong.tsx - line: 99', 'color: white; background-color: #f58899;', artistOptionValue, '<-artistOptionValue')
  console.log('%c AddSong.tsx - line: 100', 'color: white; background-color: #d815c5;', artistOptions, '<-artistOptions')
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
                console.log("onCreateOption", e)
                setArtistOptions(state => [...state, { value: e, label: e }])
                setArtistOptionValue({ value: e, label: e })
                setValue("artist", e)
              }}
              onChange={(option) => {
                console.log('%c AddSong.tsx - line: 122', 'color: white; background-color: #f58801;', option, '<-option')
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

        <Button type="submit" colorScheme="blue" isLoading={isPending || isVerifying} isDisabled={isPending || isVerifying}>
          Save
        </Button>
      </form>
    </PageWrapper>
  );
};

export default AddSong;
