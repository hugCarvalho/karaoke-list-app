import { Center, Heading } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getSongsList } from "../../api/api";
import PageWrapper from "../../components/PageWrapper";
import MostSangBarChart from "../../components/stats/MostSangBarChart";
import { Song } from "../../config/interfaces";
import { QUERIES } from "../../constants/queries";

export default function Statistics() {

  const { data, isLoading, isError, error } = useQuery<Song[]>({
    queryKey: [QUERIES.SONGS_LIST],
    queryFn: getSongsList,
    initialData: [],
  });

  return (
    <PageWrapper>
      <Center mb={4}>
        <Heading size="lg">Statistics</Heading>
      </Center>
      <MostSangBarChart data={data} />

    </PageWrapper>
  )
}
