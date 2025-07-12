import { Button, Center, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getEventsList } from "../../api/api";
import PageHeader from "../../components/buttonGroups/Header";
import { EventCard } from "../../components/EventsCard";
import PageWrapper from "../../components/PageWrapper";
import { Data, KaraokeEvents } from "../../config/interfaces";
import { QUERIES } from "../../constants/queries";
import { useCloseEvent } from "../../hooks/useCloseEvent";
import { useCreateEvent } from "../../hooks/useCreateEvent";

//TODO: location
export const EventsHistory = () => {
  const { mutate: createEventMutation, isPending: isCreateEventPending } = useCreateEvent();
  const { mutate: closeEventMutation, isPending: isCloseEventPending, isSuccess } = useCloseEvent();
  const { data: eventsList, isLoading, isFetching, isRefetching } = useQuery<Data["events"]>({
    queryKey: [QUERIES.GET_EVENTS_LIST],
    queryFn: getEventsList,
  });
  const isEventOpen = eventsList?.some((e: KaraokeEvents) => !e.closed) ?? false;

  return (
    <PageWrapper>
      <PageHeader title="Performances" tooltipLabel="List of all your performances" />
      {
        isLoading &&
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      }
      {/* OPEN EVENT */}
      {!isEventOpen && (
        <VStack spacing={4} align="center" mb={8}>
          <Text fontSize="lg">{!isEventOpen && "You have no events open. Create one?"}</Text>
          <Button
            isLoading={isCreateEventPending}
            isDisabled={isCreateEventPending}
            onClick={() => createEventMutation()}
          >
            Create Event
          </Button>
        </VStack>
      )}
      {/* CLOSE EVENT */}
      {isEventOpen && (
        <VStack spacing={4} mb={10}>
          <Heading as="h2" size="md" color={"burlywood"}>Active Event</Heading>
          {eventsList?.map((event: KaraokeEvents) => {
            if (!event.closed) {
              return <EventCard key={event._id} event={event} showDeleteButton={true} />
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
      {eventsList && eventsList.filter(event => event.closed).length > 0 && (
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
