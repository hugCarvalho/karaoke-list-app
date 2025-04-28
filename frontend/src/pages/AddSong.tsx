import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, Heading, IconButton, Input, Tooltip, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as uuid from "uuid";
import * as z from "zod";
import { addSong } from "../api/api";
import CheckboxGroup from "../components/CheckboxGroup";
import PageWrapper from "../components/PageWrapper";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";

export const baseSongFormSchema = z.object({
  artist: z.string().min(1, "Artist is required."),
  title: z.string().min(1, "Artist is required."),
  fav: z.boolean(),
  blacklisted: z.boolean(),
  inNextEventList: z.boolean(),
  plays: z.number(),
});

export type BaseSongFormData = z.infer<typeof baseSongFormSchema>;

const defaultValues = {
  title: "",
  artist: "",
  fav: false,
  blacklisted: false,
  inNextEventList: false,
  plays: 0
}

const AddSong = () => {
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<BaseSongFormData>({
    resolver: zodResolver(baseSongFormSchema),
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
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] })
      reset();
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

  const onSubmit = (data: BaseSongFormData) => {
    const eventData = {
      location: "",
      eventDate: null
    }
    const songData = { songId: uuid.v4(), events: [eventData], ...data };
    addSongMutation(songData);
  }

  return (
    <PageWrapper>
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

        <CheckboxGroup
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

export default AddSong;
