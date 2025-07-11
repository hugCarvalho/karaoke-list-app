import { DeleteIcon } from '@chakra-ui/icons';
import { Card, CardBody, Flex, HStack, IconButton, Spacer, Tag, Text, VStack } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { deleteSongFromCurrentEvent } from '../api/api';
import { KaraokeEvents } from '../config/interfaces';
import queryClient from '../config/queryClient';
import { QUERIES } from '../constants/queries';
import useAppToast from '../hooks/useAppToast';

type Props = { event: KaraokeEvents, showDeleteButton?: boolean }

const EventCard = ({ event, showDeleteButton }: Props) => {
  const { showSuccessToast, showErrorToast } = useAppToast();

  const { mutate: deleteSong, isSuccess: isDeleteSongSuccess } = useMutation({
    mutationFn: deleteSongFromCurrentEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error deleting song",
        error?.message || "An error occurred while deleting the song."
      );
    },
  });

  const [songToDeleteId, setSongToDeleteId] = useState<string | null>(null);
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
      setSongToDeleteId(songId);
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
          <VStack align="stretch" spacing={1} pt={1}>
            {numberOfSongs > 0 ? (
              event.songs.map((song, index: number) => {
                return <HStack key={index} spacing={1} wrap="wrap" p={1} borderRadius="sm" bg="rgba(255,255,255,0.03)">
                  <Text fontSize="sm" color="gray.300" flexShrink={0}>
                    🎤 {song.artist} -
                  </Text>
                  <Text as="span" fontSize="sm" color="yellow.300" fontWeight="normal" flexShrink={1} noOfLines={1}>
                    {song.name}
                  </Text>
                  {showDeleteButton && <IconButton
                    icon={<DeleteIcon />}
                    size={"sm"}
                    variant="ghost"
                    onClick={() => handleDeleteSong(song._id, song.name)}
                    // isLoading={isThisSongBeingDeleted}
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
