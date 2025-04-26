import { Box, Container, useMediaQuery } from '@chakra-ui/react';
import { ReactNode } from 'react';

const PageWrapper = ({ children }: { children: ReactNode }) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)'); // TODO: breakpoint to constant

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
