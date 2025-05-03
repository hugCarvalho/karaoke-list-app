import { Center, Spinner, Td, Tr, useMediaQuery } from "@chakra-ui/react";

export default function TableSpinner() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  return (
    <Tr>
      <Td colSpan={isMobile ? 3 : 6} textAlign="center">
        <Center>
          <Spinner />
        </Center>
      </Td>
    </Tr>
  )
}
