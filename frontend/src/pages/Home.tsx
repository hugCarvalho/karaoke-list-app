import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Tooltip,
  useMediaQuery,
  useToast
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as uuid from "uuid";
import * as z from "zod";
import { addSong } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";

const schema = z.object({
  artist: z.string().min(1, "Artist is required."),
  title: z.string().min(1, "Artist is required."),
  fav: z.boolean(),
  blacklisted: z.boolean(),
  inNextEventList: z.boolean(),
  plays: z.number(),
});

type FormData = z.infer<typeof schema>;

const Home = () => {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const toast = useToast();
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
      plays: 0
    },
  });

  const { mutate: addSongMutation, isPending, isError } = useMutation({
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

  const fav = watch("fav");
  const blacklisted = watch("blacklisted");
  const inNextEventList = watch("inNextEventList");

  const onSubmit = (data: FormData) => {
    console.log("FRONTEND-REQUEST", data);
    const eventData = {
      location: "",
      eventDate: null
    }
    const songData = { songId: uuid.v4(), events: [eventData], ...data }; // eventDate is already in data
    addSongMutation(songData);
  }

  const handleBlacklistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("blacklisted", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("fav", false);
      setValue("inNextEventList", false);
    }
  }

  const handleFavChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("fav", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("blacklisted", false, { shouldValidate: false });
    }
  }

  const handleNextEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("inNextEventList", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("blacklisted", false, { shouldValidate: false });
    }
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
        <Flex direction={isMobile ? "column" : "row"} gap={4} mb={4}>
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


        <Flex direction={isMobile ? "column" : "row"} gap={4} mb={4}>
          <Checkbox isChecked={fav} {...register("fav")} onChange={handleFavChange}>
            Fav
          </Checkbox>
          <Checkbox isChecked={inNextEventList} {...register("inNextEventList")} onChange={handleNextEventChange}>
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

export default Home;
