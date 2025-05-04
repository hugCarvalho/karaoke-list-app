import { Center, Heading } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getSongsList } from "../api/api";
import PageWrapper from "../components/PageWrapper";
import { Song } from "../config/interfaces";
import { QUERIES } from "../constants/queries";

export default function Statistics() {

  const { data, isLoading, isError, error } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: [],
  });

  console.log('%c Statistics.tsx - line: 16', 'color: white; background-color: #00cc29', data, '<-data')
  return (
    <PageWrapper>
      <Center mb={4}>
        <Heading size="lg">Statistics</Heading>
      </Center>
    </PageWrapper>
  )
}
