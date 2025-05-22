import { Card, CardBody, Flex, HStack, Spacer, Tag, Text, VStack } from '@chakra-ui/react';
import { KaraokeEvents } from '../config/interfaces';

type Props = { event: KaraokeEvents }

const EventCard = ({ event }: Props) => {

  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short', // e.g., "Jan"
      day: 'numeric',
    })
    : 'N/A';

  return (
    <Card
      bg="gray.900"
      color="gray.100"
      borderRadius="sm"
      boxShadow="xl"
      p={2}
      maxW={{ base: "xs", sm: "sm", md: "md" }}
      minW={{ base: "xs", sm: "sm", md: "sm" }}
      mx="auto"
      my={2}
      border="1px solid"
      borderColor="blue.700"
      overflow="hidden"
    >
      <CardBody p={0}>
        <VStack align="stretch" spacing={3}>
          {/* Location and Date Header */}
          <Flex alignItems="center" pb={2} borderBottom="1px solid" borderColor="gray.700">
            <Text fontSize="md" fontWeight="bold" color="blue.300">
              📍 {event.location}
            </Text>
            <Spacer />
            {event.eventDate && (
              <Tag size="sm" variant="subtle" color="white" borderRadius="full">
                🗓️ {formattedDate}
              </Tag>
            )}
          </Flex>

          {/* Songs List */}
          <VStack align="stretch" spacing={1} pt={1}>
            {event.songs.length > 0 ? (
              event.songs.map((song, index: number) => (
                <HStack key={index} spacing={1} wrap="wrap" p={1} borderRadius="sm" bg="rgba(255,255,255,0.03)">
                  <Text fontSize="sm" color="gray.300" flexShrink={0}>
                    🎤 {song.artist} -
                  </Text>
                  <Text as="span" fontSize="sm" color="yellow.300" fontWeight="normal" flexShrink={1} noOfLines={1}>
                    {song.name}
                  </Text>
                </HStack>
              ))
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

