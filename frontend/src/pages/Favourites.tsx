import { Box, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getSongsList, updatePlayCount } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import { TableBody } from "../components/table/TableBody";
import { TableHeader } from "../components/table/TableHeader";
import TableWrapper from "../components/TableWrapper";
import { ACTIONS } from "../config/actions";
import { SortConfig } from "../config/formInterfaces";
import { Song } from "../config/interfaces";
import { QUERIES } from "../constants/queries";

const Favourites = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "artist", direction: "ascending" });
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: songs, isLoading } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: []
  });

  const { mutate: addSongMutation } = useMutation({
    mutationFn: updatePlayCount,
    onSuccess: () => {
      toast({
        title: "Song updated.",
        description: "The song has been updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: [QUERIES.SONGS_LIST] });
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
      return [];
    }
    const favs = songs.filter((song) => song.fav);
    return ACTIONS.sortList(sortConfig, favs);
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
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
            No songs favoured yet!
          </Text>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TableWrapper>
        <TableHeader sortConfig={sortConfig} requestSort={requestSort} />
        <TableBody
          isLoading={isLoading}
          sortedSongs={sortedSongs}
          addSongMutation={addSongMutation}
        />
      </TableWrapper>
    </PageWrapper>
  );
};

export default Favourites;
