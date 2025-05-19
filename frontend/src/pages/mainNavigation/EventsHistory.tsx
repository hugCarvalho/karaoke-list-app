import { Button, useToast } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment } from "react/jsx-runtime";
import { createEvent, getEventsList } from "../../api/api";
import PageWrapper from "../../components/PageWrapper";
import { Data, EventSongData, KaraokeEvents } from "../../config/interfaces";
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

  console.log('%c EventsHistory.tsx - line: 49', 'color: white; background-color: #00cc29', eventsList, '<-eventsList')

  //TODO:
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
            <h1>Active Event</h1>
            {eventsList?.map((event: KaraokeEvents, index: number) => {
              if (!event.closed) {
                return <div key={index}>
                  <p>Date:{event?.eventDate}</p>
                  <p>Loc:{event.location}</p>
                  <div>
                    {event.songs.map((song: EventSongData, index: number) => {
                      return <Fragment key={index}>
                        <p>{song.artist} -
                          <span >{song.name}</span>
                        </p>
                      </Fragment>
                    })}
                  </div>
                </div>
              }
            }
            )}
          </div>
          <button>Finish event</button>
        </>
      }
      {/* {
        !isLoading && eventsList?.length > 0 && <>
          {eventsList?.map((event: KaraokeEvents, index: number) => {
            if (event.closed) {
              <h1>Finished Events</h1>
              return <div key={index}>
                <p>Date:{event?.eventDate}</p>
                <p>Loc:{event.location}</p>
                <div>
                  {event.songs.map((song: EventSongData, index: number) => {
                    return <Fragment key={index}>
                      <p>{song.artist} -
                        <span >{song.name}</span>
                      </p>
                    </Fragment>
                  })}
                </div>
              </div>
            }
          }
          )}

        </>
      } */}
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
