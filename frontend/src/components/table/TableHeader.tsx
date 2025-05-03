import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { IconButton, Th, Thead, Tr } from "@chakra-ui/react";
import { SortConfig } from "../../config/formInterfaces";

type TableHeaderProps = {
  sortConfig: SortConfig;
  requestSort: (key: SortConfig["key"]) => void;
}

export const TableHeader = ({ sortConfig, requestSort }: TableHeaderProps) => {
  const thFontSize = { base: "sm", md: "md" };
  const iconButtonSize = "xs";
  const iconButtonVariant = "ghost";

  return (
    <Thead>
      <Tr>
        <Th fontSize={thFontSize}>
          Song
          <IconButton
            aria-label="Sort by Song"
            icon={sortConfig.key === "title" && sortConfig.direction !== "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
            onClick={() => requestSort("title")}
            size={iconButtonSize}
            variant={iconButtonVariant}
          />
        </Th>
        <Th fontSize={thFontSize}>
          Artist
          <IconButton
            aria-label="Sort by Artist"
            icon={sortConfig.key === "artist" && sortConfig.direction !== "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
            onClick={() => requestSort("artist")}
            size={iconButtonSize}
            variant={iconButtonVariant}
          />
        </Th>
        <Th fontSize={thFontSize}>
          Plays
          <IconButton
            aria-label="Sort by play count"
            icon={sortConfig.key === "plays" && sortConfig.direction === "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
            onClick={() => requestSort("plays")}
            size={iconButtonSize}
            variant={iconButtonVariant}
          />
        </Th>
        <Th fontSize={thFontSize}>Add play</Th>
        <Th fontSize={thFontSize}>Last sang</Th>
      </Tr>
    </Thead>
  );
};
