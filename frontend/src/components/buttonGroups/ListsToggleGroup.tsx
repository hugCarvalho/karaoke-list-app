import { Button, HStack } from "@chakra-ui/react";
import { ListType } from "../../config/types";

type Props = {
  listName: ListType
  setListName: (name: ListType) => void
}

export const ListsToggleGroup = ({ listName, setListName }: Props) => {
  const isAll = listName === null;
  const isFav = listName === "fav";
  const isBlacklist = listName === "blacklist";
  const isDuet = listName === "duet";
  const isNextEvent = listName === "nextEvent";


  return (
    <HStack spacing={0} mb={4}>
      <Button
        isActive={isAll}
        onClick={() => {
          setListName(null)
        }}
        size="sm"
        variant={isAll ? "solid" : "outline"}
        colorScheme={isAll ? "blue" : undefined}
        borderRadius="md"
        borderRightRadius={0}
      >
        All
      </Button>
      <Button
        isActive={isFav}
        onClick={() => {
          setListName("fav")
        }}
        size="sm"
        variant={isFav ? "solid" : "outline"}
        colorScheme={isFav ? "blue" : undefined}
        borderRadius="md"
        borderLeftRadius={0}
        borderRightRadius={0}
      >
        Fav
      </Button>
      <Button
        isActive={isBlacklist}
        onClick={() => {
          setListName("blacklist")
        }}
        size="sm"
        variant={isBlacklist ? "solid" : "outline"}
        colorScheme={isBlacklist ? "blue" : undefined}
        borderLeftRadius={0}
        borderRightRadius={0}
      >
        Blacklist
      </Button>
      <Button
        isActive={isDuet}
        onClick={() => {
          setListName("duet")
        }}
        size="sm"
        variant={isDuet ? "solid" : "outline"}
        colorScheme={isDuet ? "blue" : undefined}
        borderLeftRadius={0}
        borderRightRadius={0}
      >
        Duet
      </Button>
      <Button
        isActive={isNextEvent}
        onClick={() => {
          setListName("nextEvent")
        }}
        size="sm"
        variant={isNextEvent ? "solid" : "outline"}
        colorScheme={isNextEvent ? "blue" : undefined}
        borderRadius="md"
        borderLeftRadius={0}
      >
        Next Event
      </Button>
    </HStack>
  );
};
