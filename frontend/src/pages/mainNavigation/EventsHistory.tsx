import { Button, Center, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { closeEvent, createEvent, getEventsList } from "../../api/api";
import PageHeader from "../../components/buttonGroups/Header";
import { EventCard } from "../../components/EventsCard";
import PageWrapper from "../../components/PageWrapper";
import { Data, KaraokeEvents } from "../../config/interfaces";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";
import useAppToast from "../../hooks/useAppToast";

//TODO: eventDate && location
export const eventData: KaraokeEvents = {
  location: "Monster Ronson",
  eventDate: Date.now(),
  songs: [],
  closed: false,
}

export const EventsHistory = () => {
  const { showSuccessToast, showErrorToast } = useAppToast()

  const { data: eventsList, isLoading, isFetching } = useQuery<Data["events"]>({
    queryKey: [QUERIES.GET_EVENTS_LIST],
    queryFn: getEventsList,
  });

  const isEventOpen = eventsList?.some((e: KaraokeEvents) => !e.closed) ?? false;

  const { mutate: createEventMutation, isPending } = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      showSuccessToast("Event Created.", "The event has been added to your list.");
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] })
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error creating event.",
        error?.message || "An unexpected error occurred while creating the event."
      );
    },
  });

  const { mutate: closeEventMutation, isPending: isCloseEventPending } = useMutation({
    mutationFn: closeEvent,
    onSuccess: () => {
      showSuccessToast("Event Closed.", "The event has been successfully closed.");
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] })
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error closing event.",
        error?.message || "An unexpected error occurred while closing the event."
      );
    },
  });

  return (
    <PageWrapper>
      <PageHeader title="Performances" tooltipLabel="List of all your performances" />
      {
        (isLoading || isFetching) && <Center py={10}><Spinner size="xl" /></Center>
      }
      {!isLoading && !isFetching && isEventOpen && (
        <VStack spacing={4} mb={10}>
          <Heading as="h2" size="md" color={"burlywood"}>Active Event</Heading>
          {eventsList?.map((event: KaraokeEvents) => {
            if (!event.closed) {
              return <EventCard key={event._id} event={event} />
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
      )}
      {!isLoading && !isFetching && !isEventOpen && (
        <VStack spacing={4} align="center" mb={8}>
          <Text fontSize="lg">{!isEventOpen && "You have no events open. Create one?"}</Text>
          <Button
            isLoading={isPending}
            isDisabled={isPending}
            onClick={() => createEventMutation(eventData)}
          >
            Create Event
          </Button>
        </VStack>
      )}
      {!isLoading && eventsList && eventsList.filter(event => event.closed).length > 0 && (
        <VStack spacing={2} align="stretch">
          <Heading as="h3" size="lg" textAlign={"center"}>Events History</Heading>
          {eventsList?.map((event: KaraokeEvents) => {
            if (event.closed) {
              return <EventCard key={event._id} event={event} />
            }
            return null;
          }).reverse()}
        </VStack>
      )}
    </PageWrapper>
  )
}
