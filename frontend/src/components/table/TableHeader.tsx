import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { IconButton, Th, Thead, Tr } from "@chakra-ui/react";
import { SortConfig } from "../../config/formInterfaces";

type TableHeadProps = {
  sortConfig: SortConfig;
  requestSort: (key: SortConfig["key"]) => void;
  tableFontSize: { base: string; md: string };
};

export const TableHead = ({ sortConfig, requestSort, tableFontSize }: TableHeadProps) => {
  return (
    <Thead>
      <Tr>
        <Th fontSize={tableFontSize} textAlign="center" minWidth={120}>
          Song
          <IconButton
            aria-label="Sort by Song"
            icon={
              sortConfig.key === "title" && sortConfig.direction !== "ascending" ? (
                <TriangleUpIcon />
              ) : (
                <TriangleDownIcon />
              )
            }
            onClick={() => requestSort("title")}
            size="xs"
            variant="ghost"
          />
        </Th>
        <Th fontSize={tableFontSize} minWidth={100}>
          Artist
          <IconButton
            aria-label="Sort by Artist"
            icon={
              sortConfig.key === "artist" && sortConfig.direction !== "ascending" ? (
                <TriangleUpIcon />
              ) : (
                <TriangleDownIcon />
              )
            }
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
        <Th fontSize={tableFontSize} minW={{ base: "15%", md: "auto" }}>Plays</Th>
        <Th fontSize={tableFontSize} minW={{ base: "20%", md: "auto" }}>Add Play</Th>
        <Th fontSize={tableFontSize} minW={{ base: "25%", md: "auto" }}>Last Sang</Th>
        <Th fontSize={tableFontSize} textAlign="center" minW={{ base: "15%", md: "auto" }}>Delete</Th>
      </Tr>
    </Thead>
  );
};

