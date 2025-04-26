import {
  Button,
  ButtonGroup,
  Flex,
  useMediaQuery,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

const NavButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const buttons = [
    { label: "Add", path: "/", icon: "➕" },
    { label: "Sang", path: "/songs-sang", icon: "🎤" },
    { label: "List", path: "/list", icon: "📜" },
    { label: "Fav", path: "/favourites", icon: "⭐" },
    { label: "Blacklist", path: "/blacklist", icon: "🚫" },
    { label: "Next", path: "/next-event-list", icon: "⏭️" },
  ];

  return (
    <Flex
      p={4}
      position={"fixed"}
      zIndex={100}
      width={"100%"}
      justify={"center"}
    >
      <ButtonGroup isAttached variant="outline" >
        {buttons.map((button) => (
          <Button
            key={button.path}
            onClick={() => navigate(button.path)}
            isActive={location.pathname === button.path}
            px={isMobile ? 2 : 4}
            py={isMobile ? 1 : 2}
          >
            {isMobile ? button.label : `${button.label} ${button.icon}`}
          </Button>
        ))}
      </ButtonGroup>
    </Flex>
  );
};

export default NavButtons;
