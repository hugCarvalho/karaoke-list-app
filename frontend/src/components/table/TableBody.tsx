import { Button, Tbody, Td, Tr } from "@chakra-ui/react";
import { Song } from "../../config/interfaces";
import { formatToGermanDate } from "../../utils/date";
import TableSpinner from "./TableSpinner";

type TableBodyProps = {
  isLoading: boolean;
  sortedSongs: Song[];
  addSongMutation: (variables: any, options?: any) => void;
}

export const TableBody = ({ isLoading, sortedSongs, addSongMutation }: TableBodyProps) => {
  const tdFontSize = { base: "sm", md: "md" };
  const buttonSize = { base: "xs", md: "sm" };

  return (
    <Tbody>
      {!isLoading && sortedSongs.map((song) => {
        const lastEvent = song.events.slice(-1)[0];
        const lastSangDate = lastEvent ? lastEvent.eventDate : null;

        return (
          <Tr key={song.songId}>
            <Td fontSize={tdFontSize}>{song.title}</Td>
            <Td fontSize={tdFontSize}>{song.artist}</Td>
            <Td fontSize={tdFontSize}>{song.plays}</Td>
            <Td fontSize={tdFontSize}>
              <Button size={buttonSize} onClick={() => addSongMutation(song)}>
                Add
              </Button>
            </Td>
            <Td fontSize={tdFontSize}>
              {lastSangDate ? formatToGermanDate(lastSangDate) : "-"}
            </Td>
          </Tr>
        );
      })}
      {isLoading && (
        <Tr>
          <Td colSpan={5} textAlign="center">
            <TableSpinner />
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
