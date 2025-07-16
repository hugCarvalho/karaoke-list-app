import { Box, Text } from '@chakra-ui/react';

function EmptyList() {
  return (
    <Box>
      <Text fontSize={"lg"} fontWeight={"bold"} textAlign={"center"} pt={8}>
        Your list is empty!😧  Go add some songs!
      </Text>
    </Box>
  );
}

export default EmptyList
