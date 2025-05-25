import { Button, useToast } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { closeEvent, createEvent, getEventsList } from "../../api/api";
import { EventCard } from "../../components/EventsCard";
import PageWrapper from "../../components/PageWrapper";
import { Data, KaraokeEvents } from "../../config/interfaces";
import queryClient from "../../config/queryClient";
import { QUERIES } from "../../constants/queries";

//TODO:
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
      // queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] })
    },
    onError: (error: any) => {
      toast({
        title: "Error adding event.",
        description: error?.message || "An error occurred while adding the event.",
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
        title: "Error adding event.",
        description: error?.message || "An error occurred while adding the event.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  //TODO:
  // 2. display events list

  return (
    <PageWrapper>
      EventsHistory
      {
        isLoading && <p>Loading...</p>
      }
      {
        !isLoading && isEventOpen && <>
          <div>
            <h1>Active Event</h1>
            {eventsList?.map((event: KaraokeEvents, index: number) => {
              if (!event.closed) {
                return <EventCard key={index} event={event} />
              }
            }
            )}
          </div>
          <Button
            isLoading={isCloseEventPending}
            isDisabled={isCloseEventPending}
            onClick={() => closeEventMutation()}
          >
            Close Event
          </Button>
        </>
      }
      {
        !isLoading && !isEventOpen && <>
          <div>
            <p>{!isEventOpen && "You have no events open. Create one?"}</p>
            <Button onClick={() => createEventMutation(eventData)}>Create event</Button>
          </div>
        </>
      }
      {
        !isLoading && eventsList?.length > 0 && <>
          <p>Events History</p>
          {eventsList?.map((event: KaraokeEvents, index: number) => {
            if (event.closed) {
              return <EventCard key={index} event={event} />
            }
          }
          )}
        </>
      }
    </PageWrapper>
  )
}
