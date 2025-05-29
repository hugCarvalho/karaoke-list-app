import { DeleteIcon } from '@chakra-ui/icons';
import { Button, Checkbox, IconButton, Tbody, Td, Tr } from '@chakra-ui/react';
import { CheckboxGroup } from '../../config/formInterfaces';
import { Song } from '../../config/interfaces';
import { useDeleteSong } from '../../hooks/list/useDeleteSong';
import { useUpdatePlayCount } from '../../hooks/list/useUpdatePlayCount';
import { useUpdateSongListTypes } from '../../hooks/list/useUpdateSongListTypes';
import { formatToGermanDate } from '../../utils/date';
import TableSpinner from './TableSpinner';

type TableBodyProps = {
  sortedSongs: Song[]
  isLoading: boolean
  tableFontSize: { base: string; md: string };
}

const checkBoxSize = { base: "sm", md: "md" };

function TableBody({ sortedSongs, isLoading, tableFontSize }: TableBodyProps) {
  const { mutate: updatePlayCountMutation } = useUpdatePlayCount()
  const { mutate: updateListTypeMutation } = useUpdateSongListTypes()
  const { mutate: deleteSongMutation, isPending: isDeletePending } = useDeleteSong();

  const handleCheckboxChange = (songId: string, value: boolean, type: CheckboxGroup) => {
    updateListTypeMutation({ songId, value: !value, type });
  };

  const handleDelete = (songId: string) => {
    deleteSongMutation({ songId });
  };

  return (
    <Tbody>
      {sortedSongs.map((song) => {
        const lastEvent = song.events.reverse()[0];
        const lastSangDate = lastEvent ? formatToGermanDate(lastEvent.eventDate) : "-";
        const typeColor = song.blacklisted ? "red" : song.fav ? "lime" : song.inNextEventList ? "blue.300" : undefined;

        return <Tr key={song.songId}>
          <Td fontSize={tableFontSize} color={typeColor} >{song.title}</Td>
          <Td fontSize={tableFontSize} color={typeColor} >{song.artist}</Td>
          <Td textAlign="center">
            <Checkbox
              isChecked={song.fav}
              size={checkBoxSize}
              onChange={() => handleCheckboxChange(song.songId, song.fav, "fav")}
            />
          </Td>
          <Td textAlign="center">
            <Checkbox
              isChecked={song.inNextEventList}
              size={checkBoxSize}
              onChange={() => handleCheckboxChange(song.songId, song.inNextEventList, "inNextEventList")}
            />
          </Td>
          <Td textAlign="center">
            <Checkbox
              isChecked={song.duet}
              onChange={() => handleCheckboxChange(song.songId, song.duet, "duet")}
              size={checkBoxSize}
            />
          </Td>
          <Td textAlign="center">
            <Checkbox
              isChecked={song.blacklisted}
              onChange={() => handleCheckboxChange(song.songId, song.blacklisted, "blacklisted")}
              size={checkBoxSize}
            />
          </Td>
          <Td textAlign="center">
            <Checkbox
              isChecked={song.notAvailable}
              onChange={() => handleCheckboxChange(song.songId, song.notAvailable, "notAvailable")}
              size={checkBoxSize}
            />
          </Td>
          <Td fontSize={tableFontSize}>{song.plays}</Td>
          <Td fontSize={tableFontSize}>
            <Button size={{ base: "xs", md: "sm" }} onClick={() => updatePlayCountMutation(song)}>
              Add
            </Button>
          </Td>
          <Td fontSize={tableFontSize}>{lastSangDate}</Td>
          <Td textAlign="center">
            <IconButton
              icon={<DeleteIcon />}
              size={checkBoxSize}
              variant="ghost"
              onClick={() => handleDelete(song.songId)}
              isLoading={isDeletePending}
              aria-label={"delete button"}
            />
          </Td>
        </Tr>
      })}
      {isLoading && <TableSpinner />}
    </Tbody>
  )
}

export default TableBody
