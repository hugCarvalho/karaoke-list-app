import { CloseIcon } from "@chakra-ui/icons";
import { Center, HStack, IconButton, Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getSongsList } from "../api/api";
import { ListsToggleGroup } from "../components/buttonGroups/ListsToggleGroup";
import EmptyList from "../components/EmptyList";
import PageWrapper from "../components/PageWrapper";
import TableBody from "../components/table/TableBody";
import { TableHead } from "../components/table/TableHeader";
import TableWrapper from "../components/table/TableWrapper";
import { Song } from "../config/interfaces";
import { ListType } from "../config/types";
import { QUERIES } from "../constants/queries";
import { useFilteredSongs } from "../hooks/list/useFilteredSongs";
import { useSortableList } from "../hooks/list/useSortableList";

const tableFontSize = { base: "xs", md: "md" };

const SongList = () => {
  const [songFilterText, setSongFilterText] = useState("");
  const [artistFilterText, setArtistFilterText] = useState("");
  const [listName, setListName] = useState<ListType>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: [],
  });

  const filteredSongs = useFilteredSongs({ data, songFilterText, artistFilterText, listName })
  const { sortedList: sortedSongs, sortConfig, requestSort } = useSortableList<Song>(filteredSongs, "artist");

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
          <TableHead sortConfig={sortConfig} requestSort={requestSort} tableFontSize={tableFontSize} />
          <TableBody isLoading={isLoading} sortedSongs={sortedSongs} tableFontSize={tableFontSize} />
        </TableWrapper>
      </VStack>
    </PageWrapper>
  );
};

export default SongList;
