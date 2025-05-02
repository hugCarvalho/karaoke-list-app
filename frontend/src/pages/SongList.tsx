import { CloseIcon, DeleteIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Center, Checkbox, HStack, IconButton, Input, InputGroup, InputRightElement, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { deleteSong, getSongsList, updateSong } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import TableSpinner from "../components/TableSpinner";
import TableWrapper from "../components/TableWrapper";
import { ACTIONS } from "../config/actions";
import { CheckboxGroup, SortConfig } from "../config/formInterfaces";
import { Song } from "../config/interfaces";
import { QUERIES } from "../constants/queries";

const checkBoxSize = { base: "sm", md: "md" };
const thFontSize = { base: "xs", md: "md" };

const SongList = () => {
  const queryClient = useQueryClient();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "artist", direction: "ascending" });
  const [songFilterText, setSongFilterText] = useState("");
  const [artistFilterText, setArtistFilterText] = useState("");

  const { data, isLoading, isError, error } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: [],
  });

  const { mutate: updateBlacklistedMutation, isPending: isUpdatePending } = useMutation({
    mutationFn: updateSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
    },
  });

  const { mutate: deleteSongMutation, isPending: isDeletePending } = useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
    },
  });

  const filteredSongs = useMemo(() => {
    if (!data) return [];
    return data.filter((song) => {
      return song.title.toLowerCase().includes(songFilterText.toLowerCase()) &&
        song.artist.toLowerCase().includes(artistFilterText.toLowerCase())
    });
  }, [data, songFilterText, artistFilterText]);

  const sortedSongs = useMemo(() => {
    if (!filteredSongs) return [];
    return ACTIONS.sortList(sortConfig, filteredSongs);
  }, [filteredSongs, sortConfig]);

  const requestSort = (key: SortConfig["key"]) => {
    let direction = "ascending" as SortConfig["direction"];
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleCheckboxChange = (songId: string, value: boolean, type: CheckboxGroup) => {
    updateBlacklistedMutation({ songId, value: !value, type });
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

  if (data?.length === 0 && !isLoading)
    return (
      <PageWrapper>
        <Center p={4}>
          <Text fontSize={"lg"} fontWeight={"bold"}>
            Your list is empty!
          </Text>
        </Center>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <VStack spacing={4} alignItems="stretch">
        <HStack spacing={4}>
          <InputGroup>
            <Input
              placeholder="Filter by song name"
              value={songFilterText}
              onChange={(e) => setSongFilterText(e.target.value)}
              size="md"
            />
            {songFilterText && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear song filter"
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={handleClearSongFilter}
                  variant="ghost"
                />
              </InputRightElement>
            )}
          </InputGroup>
          <InputGroup>
            <Input
              placeholder="Filter by artist"
              value={artistFilterText}
              onChange={(e) => setArtistFilterText(e.target.value)}
              size="md"
            />
            {artistFilterText && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear artist filter"
                  icon={<DeleteIcon />}
                  size="sm"
                  onClick={handleClearArtistFilter}
                  variant="ghost"
                />
              </InputRightElement>
            )}
          </InputGroup>
        </HStack>
        <TableWrapper >
          <Thead>
            <Tr>
              <Th fontSize={thFontSize} textAlign="center">
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
              <Th fontSize={thFontSize}>
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
              <Th fontSize={thFontSize}>Fav</Th>
              <Th fontSize={thFontSize}>Next</Th>
              <Th fontSize={thFontSize}>Duet</Th>
              <Th fontSize={thFontSize}>Blacklist</Th>
              <Th fontSize={thFontSize}>Plays</Th>
              <Th fontSize={thFontSize}>Delete</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedSongs.map((song) => (
              <Tr key={song.songId}>
                <Td fontSize={thFontSize}>{song.title}</Td>
                <Td fontSize={thFontSize}>{song.artist}</Td>
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
                <Td fontSize={thFontSize}>{song.plays}</Td>
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
            ))}
            {isLoading && <TableSpinner />}
          </Tbody>
        </TableWrapper>
      </VStack>
    </PageWrapper>
  );
};

export default SongList;
