import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  Box,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useMediaQuery
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getSongsList } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import TableSpinner from "../components/TableSpinner";
import { ACTIONS } from "../config/actions";
import { Song } from "../config/interfaces";
import { QUERIES } from "../constants/queries";
import { SortConfig } from "./SongList";

const Favourites = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "artist", direction: "ascending" });
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const { data: songs, isLoading, isError, error, isFetchedAfterMount, isFetching, isSuccess } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: []
  });


  const sortedSongs = useMemo(() => {
    if (!Boolean(songs)) {
      return []
    }
    const favs = songs.filter((song) => song.fav);
    return ACTIONS.sortList(sortConfig, favs);
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
            No songs favoured yet!
          </Text>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Box overflowX="auto" p={isMobile ? 0 : 4}>
        <Table variant="simple" size={isMobile ? "sm" : "md"}>
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
            </Tr>
          </Thead>
          <Tbody>
            {!isLoading && sortedSongs.map((song) => (
              <Tr key={song.songId}>
                <Td fontSize={isMobile ? "sm" : "md"}>{song.title}</Td>
                <Td fontSize={isMobile ? "sm" : "md"}>{song.artist}</Td>
                <Td fontSize={isMobile ? "sm" : "md"}>{song.plays}</Td>
              </Tr>
            ))}
            {isLoading && <TableSpinner />}
          </Tbody>
        </Table>
      </Box>
    </PageWrapper>
  );
};

export default Favourites;
