import { Box, Table } from "@chakra-ui/react";
import { ReactNode } from "react";

const TableWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box overflowX="auto" p={{ base: 0, md: 4 }}>
      <Table variant="simple" size={{ base: "xs", md: "sm" }} lineHeight={1.1}>
        {children}
      </Table>
    </Box>
  );
};
export default TableWrapper;
