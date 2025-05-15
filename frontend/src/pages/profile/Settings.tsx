import { Container, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import SessionCard from "../../components/SessionCard";
import { Session } from "../../config/interfaces";
import useSessions from "../../hooks/useSessions";

const Settings = () => {
  const { sessions, isPending, isSuccess, isError } = useSessions();

  return (
    <Container mt={16}>
      <Heading mb={6}>My Sessions</Heading>
      {isPending && <Spinner />}
      {isError && <Text color="red.400">Failed to get sessions.</Text>}
      {isSuccess && (
        <VStack spacing={3} align="flex-start">
          <h1>Sessions</h1>
          {Array.isArray(sessions) ? (
            sessions.map((session: Session) => {
              return <SessionCard key={session._id} session={session} />;
            })
          ) : (
            <Text>Error! No sessions found.</Text>
          )}
        </VStack>
      )}
    </Container>
  );
};
export default Settings;
