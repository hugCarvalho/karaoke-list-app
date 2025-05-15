import { Button, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import * as uuid from "uuid";
import { createEvent } from "../../api/api";
import PageWrapper from "../../components/PageWrapper";
import { KaraokeEvents } from "../../config/interfaces";

const eventData: KaraokeEvents = {
  eventId: uuid.v4(),
  location: "Monster Ronson",
  eventDate: new Date(),
  songs: [],
  closed: false,
}

export const EventsHistory = () => {
  const toast = useToast();

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

  console.log('%c EventsHistory.tsx - line: 42', 'color: white; background-color: #00cc29', status, '<-status')

  return (
    <PageWrapper>
      EventsHistory
      <div>
        <p>You have no events open. Create one? <button>yes</button></p>

      </div>
      <Button onClick={() => createEventMutation(eventData)}>Create event</Button>
    </PageWrapper>
  )
}
