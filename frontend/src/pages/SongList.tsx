import { CloseIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, Center, Checkbox, HStack, IconButton, Input, InputGroup, InputRightElement, Tbody, Td, Tr, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getSongsList } from "../api/api";
import { ListsToggleGroup } from "../components/buttonGroups/ListsToggleGroup";
import EmptyList from "../components/EmptyList";
import PageWrapper from "../components/PageWrapper";
import { TableHead } from "../components/table/TableHeader";
import TableSpinner from "../components/table/TableSpinner";
import TableWrapper from "../components/table/TableWrapper";
import { CheckboxGroup } from "../config/formInterfaces";
import { Song } from "../config/interfaces";
import { ListType } from "../config/types";
import { QUERIES } from "../constants/queries";
import { useDeleteSong } from "../hooks/list/useDeleteSong";
import { useFilteredSongs } from "../hooks/list/useFilteredSongs";
import { useSortableList } from "../hooks/list/useSortableList";
import { useUpdatePlayCount } from "../hooks/list/useUpdatePlayCount";
import { useUpdateSongListTypes } from "../hooks/list/useUpdateSongListTypes";
import { formatToGermanDate } from "../utils/date";

const checkBoxSize = { base: "sm", md: "md" };
const thFontSize = { base: "xs", md: "md" };

const SongList = () => {
  const [songFilterText, setSongFilterText] = useState("");
  const [artistFilterText, setArtistFilterText] = useState("");
  const [listName, setListName] = useState<ListType>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: [],
  });

  const { mutate: updatePlayCountMutation } = useUpdatePlayCount()
  const { mutate: updateListTypeMutation } = useUpdateSongListTypes()
  const { mutate: deleteSongMutation, isPending: isDeletePending } = useDeleteSong();
  const filteredSongs = useFilteredSongs({ data, songFilterText, artistFilterText, listName })
  const { sortedList: sortedSongs, sortConfig, requestSort } = useSortableList<Song>(filteredSongs, "artist");

  const handleCheckboxChange = (songId: string, value: boolean, type: CheckboxGroup) => {
    updateListTypeMutation({ songId, value: !value, type });
  };

  const handleDelete = (songId: string) => {
    deleteSongMutation({ songId });
  };

  const handleClearSongFilter = () => {
    setSongFilterText("");
  };

  const handleClearArtistFilter = () => {
    setArtistFilterText("");
  };

  if (data?.length === 0 && !isLoading && !isFetching) {
    return <EmptyList />
  }

  return (
    <PageWrapper>
      <VStack spacing={4} alignItems="stretch">
        <HStack spacing={4}>
          <InputGroup>
            <Input
              placeholder="Filter by artist"
              value={artistFilterText}
              onChange={(e) => setArtistFilterText(e.target.value)}
              size="md"
              bg="gray.100"
              _placeholder={{ color: 'gray.500' }}
              color={"blackAlpha.800"}
            />
            {artistFilterText && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear artist filter"
                  icon={<CloseIcon color={"blackAlpha.800"} />}
                  size="sm"
                  onClick={handleClearArtistFilter}
                  variant={"ghost"}
                />
              </InputRightElement>
            )}
          </InputGroup>
          <InputGroup>
            <Input
              placeholder="Filter by song name"
              value={songFilterText}
              onChange={(e) => setSongFilterText(e.target.value)}
              size="md"
              bg="gray.100"
              _placeholder={{ color: 'gray.500' }}
              color={"blackAlpha.800"}
            />
            {songFilterText && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear song filter"
                  icon={<CloseIcon color={"blackAlpha.800"} />}
                  size="sm"
                  onClick={handleClearSongFilter}
                  variant={"ghost"}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </HStack>

        <Center mt={2}>
          <ListsToggleGroup listName={listName} setListName={setListName} />
        </Center>
        <TableWrapper>

          <TableHead sortConfig={sortConfig} requestSort={requestSort} thFontSize={thFontSize} />
          <Tbody>
            {sortedSongs.map((song) => {
              const lastEvent = song.events.reverse()[0];
              const lastSangDate = lastEvent ? formatToGermanDate(lastEvent.eventDate) : "-";
              const typeColor = song.blacklisted ? "red" : song.fav ? "lime" : song.inNextEventList ? "blue.300" : undefined;

              return <Tr key={song.songId}>
                <Td fontSize={thFontSize} color={typeColor} >{song.title}</Td>
                <Td fontSize={thFontSize} color={typeColor} >{song.artist}</Td>
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
                <Td fontSize={thFontSize}>{song.plays}</Td>
                <Td fontSize={thFontSize}>
                  <Button size={{ base: "xs", md: "sm" }} onClick={() => updatePlayCountMutation(song)}>
                    Add
                  </Button>
                </Td>
                <Td fontSize={thFontSize}>{lastSangDate}</Td>
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
        </TableWrapper>
      </VStack>
    </PageWrapper>
  );
};

export default SongList;
