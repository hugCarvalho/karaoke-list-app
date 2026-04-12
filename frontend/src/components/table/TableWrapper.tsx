import { Box, Table } from "@chakra-ui/react";
import { ReactNode } from "react";

const TableWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      overflowY="auto"
      maxH="calc(100vh - 0px)" // Adjust this to match your app layout
      p={{ base: 0, md: 4 }}
    >
      <Table variant="simple" size={{ base: "xs", md: "sm" }} lineHeight={1.1}>
        {children}
      </Table>
    </Box>
  );
};
export default TableWrapper;
