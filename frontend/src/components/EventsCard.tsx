import { DeleteIcon } from '@chakra-ui/icons';
import { Card, CardBody, Flex, HStack, IconButton, Spacer, Tag, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSongFromCurrentEvent } from '../api/api';
import { KaraokeEvents } from '../config/interfaces';
import { QUERIES } from '../constants/queries';
import useAppToast from '../hooks/useAppToast';

type Props = { event: KaraokeEvents, showDeleteButton?: boolean }

const EVENTS_LIST_QUERY_KEY = [QUERIES.GET_EVENTS_LIST];

const EventCard = ({ event, showDeleteButton }: Props) => {
  const { showErrorToast } = useAppToast();

  const queryClient = useQueryClient();

  const { mutate: deleteSong } = useMutation({
    mutationFn: deleteSongFromCurrentEvent,
    onMutate: async (variables) => {
      const { songId } = variables;

      // 1. Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: EVENTS_LIST_QUERY_KEY });

      // 2. Snapshot the current data
      const previousEvents = queryClient.getQueryData<KaraokeEvents[]>(EVENTS_LIST_QUERY_KEY);

      // 3. Optimistically update the cache
      queryClient.setQueryData<KaraokeEvents[]>(EVENTS_LIST_QUERY_KEY, (oldData) => {
        if (!oldData) return oldData;

        // Find the specific event card being rendered and modify its songs array
        return oldData.map((e) => {
          if (e._id === event._id) {
            const updatedSongsList = e.songs.filter((song) => song._id !== songId);
            console.log('%c EventsCard.tsx - line: 37', 'color: white; background-color: #f58801;', updatedSongsList, '<-updatedSongs')
            return { ...e, songs: updatedSongsList };
          }
          return e;
        });
      });

      // 4. Return a context object with the snapshotted data
      return { previousEvents };
    },
    onError: (error: Error, variables, context) => {
      showErrorToast(
        "Error deleting song",
        error?.message || "An error occurred while deleting the song."
      );
      // 5. Rollback on error using the context data
      if (context?.previousEvents) {
        queryClient.setQueryData<KaraokeEvents[]>(EVENTS_LIST_QUERY_KEY, context.previousEvents);
      }
    },
    onSettled: () => {
      // 6. Invalidate and refetch to ensure client state is consistent with server
      queryClient.invalidateQueries({ queryKey: EVENTS_LIST_QUERY_KEY });
    },
  });

  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short', // e.g., "Jan"
      day: 'numeric',
    })
    : 'N/A';

  const numberOfSongs = event.songs.length

  const handleDeleteSong = (songId: string, songTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${songTitle}"?`)) {
      deleteSong({ songId });
    }
  };

  return (
    <Card
      bg="gray.900"
      color="gray.100"
      borderRadius="sm"
      boxShadow="xl"
      p={2}
      maxW={{ base: "100%", md: "lg" }}
      minW={{ base: "100%", md: 'lg' }}
      mx="auto"
      my={2}
      border="1px solid"
      borderColor="blue.700"
      overflow="hidden"
    >
      <CardBody p={0}>
        <VStack align="stretch" spacing={3}>
          {/* Location, Song Count, and Date Header */}
          <Flex alignItems="center" pb={2} borderBottom="1px solid" borderColor="gray.700">
            <Text fontSize="md" fontWeight="bold" color="blue.300">
              📍 {event.location}
            </Text>
            {/* Number of Songs Tag */}
            {numberOfSongs > 0 && (
              <Tag size="sm" variant="subtle" colorScheme="purple" borderRadius="full" ml={1.5}>
                🎤 {numberOfSongs}
              </Tag>
            )}
            <Spacer />
            {event.eventDate && (
              <Tag size="sm" variant="subtle" color="white" borderRadius="full">
                🗓️ {formattedDate}
              </Tag>
            )}
          </Flex>

          {/* Songs List */}
          <VStack align="stretch" spacing={1} pt={1} >
            {numberOfSongs > 0 ? (
              event.songs.map((song, index: number) => {

                return <HStack key={index} spacing={1} wrap="wrap" p={1} borderRadius="sm" bg="rgba(255,255,255,0.03)">
                  <Text fontSize="sm" color="gray.300" flexShrink={0}>
                    🎤 {song.artist} -
                  </Text>
                  <Text as="span" fontSize="sm" color="yellow.300" fontWeight="normal" flexShrink={1} noOfLines={1}>
                    {song.name}
                  </Text>
                  <Spacer />
                  {showDeleteButton && <IconButton
                    icon={<DeleteIcon />}
                    size={"sm"}
                    variant="ghost"
                    onClick={() => handleDeleteSong(song._id, song.name)}
                    aria-label={"`Delete song ${song.title} by ${song.artist}`"}
                  />}
                </HStack>

              })
            ) : (
              <Text fontSize="sm" color="gray.400" fontStyle="italic">
                No songs yet! 🎶
              </Text>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export { EventCard };
