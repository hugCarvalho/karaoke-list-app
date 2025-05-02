import { DeleteIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Center, Checkbox, IconButton, Tbody, Td, Text, Th, Thead, Tr, useMediaQuery } from "@chakra-ui/react";
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

//TODO: do optimistic updates for

const SongList = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "artist", direction: "ascending" });
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: []
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

  const sortedSongs = useMemo(() => {
    if (!data) return [];
    return ACTIONS.sortList(sortConfig, data);
  }, [data, sortConfig]);

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

  if (data.length === 0)
    return (
      <PageWrapper>
        <Center p={4}>
          <Text fontSize={"lg"} fontWeight={"bold"}>Your list is empty!</Text>
        </Center>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <TableWrapper>
        <Thead>
          <Tr>
            <Th fontSize={isMobile ? "sm" : "md"}>
              Song
              <IconButton
                aria-label="Sort by Song"
                icon={sortConfig.key === "title" && sortConfig.direction !== "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
                onClick={() => requestSort("title")}
                size="xs"
                variant="ghost"
              />
            </Th>
            <Th fontSize={isMobile ? "sm" : "md"}>
              Artist
              <IconButton
                aria-label="Sort by Artist"
                icon={sortConfig.key === "artist" && sortConfig.direction !== "ascending" ? <TriangleUpIcon /> : <TriangleDownIcon />}
                onClick={() => requestSort("artist")}
                size="xs"
                variant="ghost"
              />
            </Th>
            <Th fontSize={isMobile ? "sm" : "md"}>Fav</Th>
            <Th fontSize={isMobile ? "sm" : "md"}>Next</Th>
            <Th fontSize={isMobile ? "sm" : "md"}>Duet</Th>
            <Th fontSize={isMobile ? "sm" : "md"}>Blacklist</Th>
            <Th fontSize={isMobile ? "sm" : "md"}>Plays</Th>
            <Th fontSize={isMobile ? "sm" : "md"}>Delete</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedSongs.map((song) => (
            <Tr key={song.songId}>
              <Td fontSize={isMobile ? "sm" : "md"}>{song.title}</Td>
              <Td fontSize={isMobile ? "sm" : "md"}>{song.artist}</Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.fav}
                  size={isMobile ? "sm" : "md"}
                  onChange={() => handleCheckboxChange(song.songId, song.fav, "fav")}
                />
              </Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.inNextEventList}
                  size={isMobile ? "sm" : "md"}
                  onChange={() => handleCheckboxChange(song.songId, song.inNextEventList, "inNextEventList")}
                />
              </Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.duet}
                  onChange={() => handleCheckboxChange(song.songId, song.duet, "duet")}
                  size={isMobile ? "sm" : "md"}
                />
              </Td>
              <Td textAlign="center">
                <Checkbox
                  isChecked={song.blacklisted}
                  onChange={() => handleCheckboxChange(song.songId, song.blacklisted, "blacklisted")}
                  size={isMobile ? "sm" : "md"}
                />
              </Td>
              <Td fontSize={isMobile ? "sm" : "md"}>{song.plays}</Td>
              <Td textAlign="center">
                <IconButton
                  icon={<DeleteIcon />}
                  size={isMobile ? "sm" : "md"}
                  variant="ghost"
                  onClick={() => handleDelete(song.songId)}
                  isLoading={isDeletePending} // Show loading state
                  aria-label={"delete button"} />
              </Td>
            </Tr>
          ))}
          {isLoading && <TableSpinner />}
        </Tbody>
      </TableWrapper>
    </PageWrapper>
  );
};

export default SongList;
