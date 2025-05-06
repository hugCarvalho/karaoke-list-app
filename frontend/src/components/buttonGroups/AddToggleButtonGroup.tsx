import { Button, HStack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

export const AddToggleButtonGroup = () => {
  const { pathname } = useLocation();
  const isSangSongActive = pathname === "/songs-sang";
  const navigate = useNavigate();

  const handleSangClick = () => {
    navigate("/songs-sang");
  };

  const handleAddClick = () => {
    navigate("/");
  };

  return (
    <HStack spacing={0} mb={4}>
      <Button
        isActive={!isSangSongActive}
        onClick={handleAddClick}
        size="sm"
        variant={!isSangSongActive ? "solid" : "outline"}
        colorScheme={!isSangSongActive ? "blue" : undefined}
        borderRadius="md"
        borderRightRadius={0}
      >
        Add
      </Button>
      <Button
        isActive={isSangSongActive}
        onClick={handleSangClick}
        size="sm"
        variant={isSangSongActive ? "solid" : "outline"}
        colorScheme={isSangSongActive ? "blue" : undefined}
        borderRadius="md"
        borderLeftRadius={0}
      >
        Sang
      </Button>
    </HStack>
  );
};
