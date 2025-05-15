import { Button, useToast } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as uuid from "uuid";
import { createEvent, getEventsList } from "../../api/api";
import PageWrapper from "../../components/PageWrapper";
import { Data, KaraokeEvents } from "../../config/interfaces";
import { QUERIES } from "../../constants/queries";

const eventData: KaraokeEvents = {
  eventId: uuid.v4(),
  location: "Monster Ronson",
  eventDate: new Date(),
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

  console.log('%c EventsHistory.tsx - line: 51', 'color: white; background-color: #f58801;', isEventOpen, '<-isEventOpen')
  console.log('%c EventsHistory.tsx - line: 49', 'color: white; background-color: #00cc29', eventsList, '<-eventsList')

  //TODO:
  // 1. Add song to event
  // 2. display events list
  // 3. close event

  return (
    <PageWrapper>
      EventsHistory
      {
        isLoading && <p>Loading...</p>
      }
      {
        !isLoading && isEventOpen && <>
          <div>
            <p>{isEventOpen && "You already have an event open."}</p>
          </div>
        </>
      }
      {
        !isLoading && !isEventOpen && <>
          <div>
            <p>{!isEventOpen && "You have no events open. Create one? <button>yes</button>"}</p>
            <Button onClick={() => createEventMutation(eventData)}>Create event</Button>
          </div>
        </>
      }
    </PageWrapper>
  )
}
