import { Box, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getSongsList, updatePlayCount } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import { TableBody } from "../components/table/TableBody";
import { TableHeader } from "../components/table/TableHeader";
import TableWrapper from "../components/table/TableWrapper";
import { ACTIONS } from "../config/actions";
import { SortConfig } from "../config/formInterfaces";
import { Song } from "../config/interfaces";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";

const NextEvent = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "artist", direction: "ascending" });
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

  const requestSort = (key: SortConfig["key"]) => {
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
        <TableHeader sortConfig={sortConfig} requestSort={requestSort} />
        <TableBody isLoading={isLoading} sortedSongs={sortedSongs} addSongMutation={addSongMutation} />
      </TableWrapper>
    </PageWrapper>
  );
};

export default NextEvent;

