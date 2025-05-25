import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Center, Heading, IconButton, Spinner, Text, Tooltip, useToast, VStack } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { closeEvent, createEvent, getEventsList } from "../../api/api";
import { EventCard } from "../../components/EventsCard";
import PageWrapper from "../../components/PageWrapper";
import { Data, KaraokeEvents } from "../../config/interfaces";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";

//TODO: eventDate
export const eventData: KaraokeEvents = {
  location: "Monster Ronson",
  eventDate: Date.now(),
  songs: [],
  closed: false,
}

export const EventsHistory = () => {
  const toast = useToast();

  const { data: eventsList, isLoading } = useQuery<Data["events"]>({
    queryKey: [QUERIES.GET_EVENTS_LIST],
    queryFn: getEventsList,
  });

  const isEventOpen = eventsList?.some((e: KaraokeEvents) => !e.closed) ?? false;

  const { mutate: createEventMutation, status } = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast({
        title: "Event Created.",
        description: "The event has been added to your list.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] })
    },
    onError: (error: any) => {
      toast({
        title: "Error creating event.",
        description: error?.message || "An error occurred while creating the event.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const { mutate: closeEventMutation, status: closeEventStatus, isPending: isCloseEventPending } = useMutation({
    mutationFn: closeEvent,
    onSuccess: () => {
      toast({
        title: "Event Closed.",
        description: "The event has been successfully closed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] })
    },
    onError: (error: any) => {
      toast({
        title: "Error closing event.",
        description: error?.message || "An error occurred while closing the event.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  return (
    <PageWrapper>
      <Center mb={4}>
        <Heading size="lg">Performances</Heading>
        <Tooltip label="List of all your performances">
          <IconButton
            aria-label="Info"
            icon={<InfoOutlineIcon />}
            size="sm"
            ml={2}
            variant="ghost"
          />
        </Tooltip>
      </Center>
      {
        isLoading && <Center py={10}><Spinner size="xl" /></Center>
      }
      {
        !isLoading && isEventOpen && (
          <VStack spacing={4} mb={10}>
            <Heading as="h2" size="md" color={"burlywood"}>Active Event</Heading>
            {eventsList?.map((event: KaraokeEvents, index: number) => {
              if (!event.closed) {
                return <EventCard key={index} event={event} />
              }
              return null
            })}
            <Button
              isLoading={isCloseEventPending}
              isDisabled={isCloseEventPending}
              onClick={() => closeEventMutation()}
              variant={"secondary"}
            >
              Close Event
            </Button>
          </VStack>
        )
      }
      {!isLoading && !isEventOpen && (
        <VStack spacing={4} align="center" mb={8}>
          <Text fontSize="lg">{!isEventOpen && "You have no events open. Create one?"}</Text>
          <Button onClick={() => createEventMutation(eventData)} colorScheme="green">Create Event</Button>
        </VStack>
      )}
      {!isLoading && eventsList && eventsList.filter(event => event.closed).length > 0 && (
        <VStack spacing={2} align="stretch">
          <Heading as="h3" size="lg" textAlign={"center"}>Events History</Heading>
          {eventsList?.map((event: KaraokeEvents, index: number) => {
            if (event.closed) {
              return <EventCard key={index} event={event} />
            }
            return null;
          })}
        </VStack>
      )}
    </PageWrapper>
  )
}
