// src/components/table/TableBody.tsx
import { DeleteIcon } from '@chakra-ui/icons';
import { Button, Checkbox, IconButton, Tbody, Td, Tr } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckboxGroup } from '../../config/formInterfaces';
import { Data, Song } from '../../config/interfaces';
import queryClient from '../../config/queryClient';
import { QUERIES } from '../../constants/queries';
import { useDeleteSong } from '../../hooks/list/useDeleteSong';
import { useUpdatePlayCount } from '../../hooks/list/useUpdatePlayCount';
import { useUpdateSongListTypes } from '../../hooks/list/useUpdateSongListTypes';
import { formatToGermanDate } from '../../utils/date';
import { NoOpenEventModal } from '../ModalNoOpenEvent';

type TableBodyProps = {
  sortedSongs: Song[];
  tableFontSize: { base: string; md: string };
};

const checkBoxSize = { base: "sm", md: "md" };

function TableBody({ sortedSongs, tableFontSize }: TableBodyProps) {
  const navigate = useNavigate();
  const [isNoEventModalOpen, setIsNoEventModalOpen] = useState(false);
  const [songToDeleteId, setSongToDeleteId] = useState<string | null>(null);

  const { mutate: updatePlayCountMutation } = useUpdatePlayCount();
  const { mutate: updateListTypeMutation } = useUpdateSongListTypes();
  const { mutate: deleteSongMutation, isSuccess: isDeleteSongSuccess } = useDeleteSong();

  useEffect(() => {
    if (isDeleteSongSuccess) {
      setSongToDeleteId(null);
    }
  }, [isDeleteSongSuccess]);

  const handleCheckboxChange = (songId: string, value: boolean, type: CheckboxGroup) => {
    updateListTypeMutation({ songId, value: !value, type });
  };

  const handleDeleteSong = (songId: string, songTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${songTitle}"?`)) {
      setSongToDeleteId(songId);
      deleteSongMutation({ songId });
    }
  };

  const handleAddPlayClick = (songData: Song) => {
    console.log("handleAddPlayClick", songData);
    const events = queryClient.getQueryData<Data["events"]>([QUERIES.GET_EVENTS_LIST]);

    // Check if there is at least one open event
    const hasOpenEvent = events?.some((event) => !event.closed);

    if (!hasOpenEvent) {
      setIsNoEventModalOpen(true);
      return;
    }

    updatePlayCountMutation(songData);
  };

  return (
    <>
      <NoOpenEventModal
        isOpen={isNoEventModalOpen}
        onClose={() => setIsNoEventModalOpen(false)}
        onConfirm={() => navigate("/history")}
      />
      <Tbody>
        {sortedSongs.map((song) => {
          const lastEvent = [...song.events].reverse()[0];
          const lastSangDate = lastEvent ? formatToGermanDate(lastEvent.eventDate) : "-";
          const typeColor = song.blacklisted ? "red" : song.fav ? "lime" : song.inNextEventList ? "blue.300" : undefined;

          const isThisSongBeingDeleted = songToDeleteId === song.songId;

          return (
            <Tr key={song.songId}>
              <Td fontSize={tableFontSize} color={typeColor}>{song.title}</Td>
              <Td fontSize={tableFontSize} color={typeColor}>{song.artist}</Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.fav}
                  size={checkBoxSize}
                  onChange={() => handleCheckboxChange(song.songId, song.fav, "fav")}
                  aria-label={`Mark ${song.title} as favorite`}
                />
              </Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.inNextEventList}
                  size={checkBoxSize}
                  onChange={() => handleCheckboxChange(song.songId, song.inNextEventList, "inNextEventList")}
                  aria-label={`Include ${song.title} in next event list`}
                />
              </Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.duet}
                  onChange={() => handleCheckboxChange(song.songId, song.duet, "duet")}
                  size={checkBoxSize}
                  aria-label={`Mark ${song.title} as a duet`}
                />
              </Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.blacklisted}
                  onChange={() => handleCheckboxChange(song.songId, song.blacklisted, "blacklisted")}
                  size={checkBoxSize}
                  aria-label={`Blacklist ${song.title}`}
                />
              </Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.notAvailable}
                  onChange={() => handleCheckboxChange(song.songId, song.notAvailable, "notAvailable")}
                  size={checkBoxSize}
                  aria-label={`Mark ${song.title} as not available`}
                />
              </Td>
              <Td fontSize={tableFontSize} textAlign={"center"}>{song.plays}</Td>

              {/* ADD COUNT BUTTON */}
              <Td textAlign={"center"} fontSize={tableFontSize}>
                <Button
                  size={{ base: "xs", md: "sm" }}
                  onClick={() => handleAddPlayClick(song)}
                  aria-label={`Increase play count for ${song.title} by ${song.artist}`}
                >
                  Add
                </Button>
              </Td>
              <Td fontSize={tableFontSize} textAlign={"center"}>{lastSangDate}</Td>
              {/* DELETE ICON */}
              <Td textAlign="center">
                <IconButton
                  icon={<DeleteIcon />}
                  size={checkBoxSize}
                  variant="ghost"
                  onClick={() => handleDeleteSong(song.songId, song.title)}
                  isLoading={isThisSongBeingDeleted}
                  aria-label={`Delete song ${song.title} by ${song.artist}`}
                />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </>
  );
}

export default TableBody;
