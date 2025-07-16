import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";

type Song = {
  artist: string;
  title: string;
  year: number;
};

type SongSuggestionsListProps = {
  songs: Song[];
};

const SongSuggestionsList = ({ songs }: SongSuggestionsListProps) => {
  return (
    <Box mt={8}>
      <Heading size="md" mb={4} textAlign={"center"}>
        Suggested Songs
      </Heading>
      <VStack align="stretch" spacing={2}>
        {songs?.map((song, index) => (
          <Box
            key={`${song.title}-${index}`}
            p={2}
            bg="gray.50"
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="md"
            _hover={{ bg: "gray.100" }}
          >
            <HStack justify="space-between" align="center">
              <Box>
                <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                  {song.title}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {song.artist} &bull; {song.year}
                </Text>
              </Box>
              <Button
                size="sm"
                colorScheme="green"
                variant="solid"
                onClick={() => window.alert("This option will be implemented soon")}
              >
                Add
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default SongSuggestionsList;
