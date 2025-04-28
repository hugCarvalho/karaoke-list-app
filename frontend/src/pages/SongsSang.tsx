import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Center, Checkbox, Flex, FormControl, FormErrorMessage, FormLabel, Heading, IconButton, Input, Tooltip, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as uuid from "uuid";
import * as z from "zod";
import { addSong } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import { formatToGermanDate } from "../utils/date";

const schema = z.object({
  title: z.string().min(1, "Song is required."),
  artist: z.string().min(1, "Artist is required."),
  fav: z.boolean(),
  blacklisted: z.boolean(),
  inNextEventList: z.boolean(),
  location: z.string(),
  eventDate: z.date(),
  plays: z.number(),
});

type FormData = z.infer<typeof schema>;

const SongsSang = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      artist: "",
      fav: false,
      blacklisted: false,
      inNextEventList: false,
      location: "",
      eventDate: new Date(),
      plays: 1,
    },
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

  const onSubmit = (data: FormData) => {
    const eventData = {
      location: data.location,
      eventDate: data.eventDate
    }
    const songData = { songId: uuid.v4(), events: [eventData], ...data };
    addSongMutation(songData);
  };

  const handleBlacklistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("blacklisted", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("fav", false);
      setValue("inNextEventList", false);
    }
  };

  const handleFavChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("fav", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("blacklisted", false, { shouldValidate: false });
    }
  };

  const handleInNextEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("inNextEventList", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("blacklisted", false, { shouldValidate: false });
    }
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

        <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
          <Checkbox isChecked={fav} {...register("fav")} onChange={handleFavChange}>
            Fav
          </Checkbox>
          <Checkbox isChecked={inNextEventList} {...register("inNextEventList")} onChange={handleInNextEventChange}>
            Next
          </Checkbox>
          <Checkbox isChecked={blacklisted} {...register("blacklisted")} onChange={handleBlacklistChange}>
            Blacklist
          </Checkbox>
        </Flex>

        <Button type="submit" colorScheme="blue" isLoading={isPending}>
          Save
        </Button>
      </form>
    </PageWrapper>
  );
};

export default SongsSang;
