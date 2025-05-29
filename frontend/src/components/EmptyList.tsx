import { Center, Text } from '@chakra-ui/react';
import PageWrapper from './PageWrapper';

function EmptyList() {
  return (
    <PageWrapper>
      <Center p={4}>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          Your list is empty!
        </Text>
      </Center>
    </PageWrapper>
  );
}

export default EmptyList
