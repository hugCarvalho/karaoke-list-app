import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Box, Button, IconButton, Tbody, Td, Text, Th, Thead, Tr, useMediaQuery, useToast } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getSongsList, updatePlayCount } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import TableSpinner from "../components/TableSpinner";
import TableWrapper from "../components/TableWrapper";
import { ACTIONS } from "../config/actions";
import { Song } from "../config/interfaces";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import { SortConfig } from "./SongList";

const NextEvent = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "artist", direction: "ascending" });
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const toast = useToast();

  const { data: songs, isLoading, isError, error } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: []
  });
  const { mutate: addSongMutation, isPending } = useMutation({
    mutationFn: updatePlayCount,
    onSuccess: () => {
      toast({
        title: "Song updated.",
        description: "The song has been updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] })
    },
    onError: (error: any) => {
      toast({
        title: "Error updating song.",
        description: error?.message || "An error occurred while updating the song.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  const sortedSongs = useMemo(() => {
    if (!Boolean(songs)) {
      return []
    }
    const nextSongs = songs.filter((song) => song.inNextEventList);
    return ACTIONS.sortList(sortConfig, nextSongs);
  }, [sortConfig, songs]);

  const requestSort = (key: "artist" | "title") => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  if (sortedSongs.length === 0) {
    return (
      <PageWrapper>
        <Box p={4} textAlign="center">
          <Text fontSize="lg" fontWeight="semibold">
            No songs for next event yet!
          </Text>
        </Box>
      </PageWrapper>
    );
  }

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
            <Th fontSize={isMobile ? "sm" : "md"}>Plays</Th>
            <Th fontSize={isMobile ? "sm" : "md"}>Add Play</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!isLoading && sortedSongs.map((song) => (
            <Tr key={song.songId}>
              <Td fontSize={isMobile ? "sm" : "md"}>{song.title}</Td>
              <Td fontSize={isMobile ? "sm" : "md"}>{song.artist}</Td>
              <Td fontSize={isMobile ? "sm" : "md"}>{song.plays}</Td>
              <Td fontSize={{ base: "sm", md: "md" }}>
                <Button
                  size={{ base: "xs", md: "sm" }}
                  onClick={() => addSongMutation(song)}
                >
                  Add
                </Button>
              </Td>
            </Tr>
          ))}
          {isLoading && <TableSpinner />}
        </Tbody>
      </TableWrapper>
    </PageWrapper>
  );
};

export default NextEvent;

