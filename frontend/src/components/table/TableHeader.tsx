//frontend/src/components/table/TableHeader.tsx
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { IconButton, Th, Thead, Tr } from "@chakra-ui/react";
import { SortConfig } from "../../config/formInterfaces";

type TableHeadProps = {
  sortConfig: SortConfig;
  requestSort: (key: SortConfig["key"]) => void;
  tableFontSize: { base: string; md: string };
};
const stickyStyles = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  bg: "#19202c", // MUST be opaque, otherwise text will overlap
  // borderBottom: "1px solid #333" // Optional: gives it a nice clean edge
};
export const TableHeader = ({ sortConfig, requestSort, tableFontSize }: TableHeadProps) => {
  return (
    <Thead sx={stickyStyles}>
      <Tr>
        <Th fontSize={tableFontSize} textAlign="center" minWidth={120}>
          Song
          <IconButton
            aria-label="Sort by Song"
            icon={sortConfig.key === "title" && sortConfig.direction !== "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
            onClick={() => requestSort("title")}
            size="xs"
            variant="ghost"
          />
        </Th>
        <Th fontSize={tableFontSize} minWidth={100}>
          Artist
          <IconButton
            aria-label="Sort by Artist"
            icon={sortConfig.key === "artist" && sortConfig.direction !== "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
            onClick={() => requestSort("artist")}
            size="xs"
            variant="ghost"
          />
        </Th>
        <Th fontSize={tableFontSize} minW={{ base: "15%", md: "auto" }}>Fav</Th>
        <Th fontSize={tableFontSize} minW={{ base: "15%", md: "auto" }}>Next</Th>
        <Th fontSize={tableFontSize} minW={{ base: "15%", md: "auto" }}>Duet</Th>
        <Th fontSize={tableFontSize} minW={{ base: "15%", md: "auto" }}>Blacklist</Th>
        <Th fontSize={tableFontSize} minW={{ base: "15%", md: "auto" }}>N/A</Th>
        <Th fontSize={tableFontSize} minWidth={100} textAlign="center">
          Plays
          <IconButton
            aria-label="Sort by Plays"
            icon={sortConfig.key === "plays" && sortConfig.direction !== "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
            onClick={() => requestSort("plays")}
            size="xs"
            variant="ghost"
          />
        </Th>
        <Th fontSize={tableFontSize} textAlign="center" minW={{ base: "20%", md: "auto" }}>Add Play</Th>
        <Th fontSize={tableFontSize} textAlign="center" minW={{ base: "25%", md: "auto" }}>Last Sang</Th>
        <Th fontSize={tableFontSize} textAlign="center" minW={{ base: "15%", md: "auto" }}>Delete</Th>
      </Tr>
    </Thead>
  );
};

