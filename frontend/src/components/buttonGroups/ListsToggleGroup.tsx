import { Button, ButtonGroup } from "@chakra-ui/react";
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
  const isNotAvailable = listName === "notAvailable";

  const buttons = [
    { label: "All", path: "", icon: "📜", active: isAll, action: () => setListName(null) },
    { label: "Fav", path: "", icon: "⭐", active: isFav, action: () => setListName("fav") },
    { label: "Duet", path: "", icon: "🎤", active: isDuet, action: () => setListName("duet") },
    { label: "Blacklist", path: "", icon: "", active: isBlacklist, action: () => setListName("blacklist") },
    { label: "N/A", path: "", icon: "🚫", active: isNotAvailable, action: () => setListName("notAvailable") },
    { label: "Next", path: "", icon: "⏭️", active: isNextEvent, action: () => setListName("nextEvent") },
  ]

  return (
    <ButtonGroup variant={"outline"} isAttached display={"flex"}  >
      {buttons.map((button) => (
        <Button
          key={button.label}
          onClick={button.action}
          size="sm"
          variant={button.active ? "solid" : "outline"}
          colorScheme={button.active ? "yellow" : undefined}
          borderRadius="md"
          px={{ base: 2, md: 4 }}
          py={{ base: 1, md: 2 }}
        >
          {button.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};
