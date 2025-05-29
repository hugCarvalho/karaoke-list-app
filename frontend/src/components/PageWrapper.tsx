import { Box, Container } from '@chakra-ui/react';
import { ReactNode } from 'react';

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
    >
      <Container
        maxW="container.xl"
        flex="1"
        p={5}
        pt={20}
      >
        {children}
      </Container>
    </Box>
  );
};

export default PageWrapper;
