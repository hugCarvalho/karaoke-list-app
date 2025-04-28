import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, Heading, IconButton, Input, Tooltip, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, UseFormRegister } from "react-hook-form";
import * as uuid from "uuid";
import * as z from "zod";
import { addSong } from "../api/api";
import CheckboxGroup from "../components/CheckboxGroup";
import PageWrapper from "../components/PageWrapper";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import { formatToGermanDate } from "../utils/date";
import { BaseSongFormData, baseSongFormSchema } from "./AddSong";

const songsSangFormSchema = baseSongFormSchema.extend({
  location: z.string(),
  eventDate: z.date(),
});

export type SongsSangFormData = z.infer<typeof songsSangFormSchema>;

const defaultValues = {
  title: "",
  artist: "",
  fav: false,
  blacklisted: false,
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
  const inNextEventList = watch("inNextEventList");

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
          <FormControl isInvalid={!!errors.title} isRequired>
            <FormLabel>Song</FormLabel>
            <Input {...register("title")} />
            {errors.title && (
              <FormErrorMessage>{errors.title.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.artist} isRequired>
            <FormLabel>Artist</FormLabel>
            <Input {...register("artist")} />
            {errors.artist && (
              <FormErrorMessage>{errors.artist.message}</FormErrorMessage>
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
          register={register as UseFormRegister<SongsSangFormData | BaseSongFormData>}
          fav={fav}
          blacklisted={blacklisted}
          inNextEventList={inNextEventList}
          setValue={setValue as UseFormRegister<SongsSangFormData>}
        />

        <Button type="submit" colorScheme="blue" isLoading={isPending}>
          Save
        </Button>
      </form>
    </PageWrapper>
  );
};

export default SongsSang;
