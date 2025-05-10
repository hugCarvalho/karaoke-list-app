import { Button, ButtonGroup, Flex, useMediaQuery, } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

const NavButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const buttons = [
    { label: "Add", path: "/", icon: "➕" },
    { label: "List", path: "/list", icon: "📜" },
    // { label: "Fav", path: "/favourites", icon: "⭐" },
    // { label: "Blacklist", path: "/blacklist", icon: "🚫" },
    // { label: "Duet", path: "/duet", icon: "🎤" },
    // { label: "Next", path: "/next-event-list", icon: "⏭️" },
  ];

  return (
    <Flex
      p={4}
      position={"fixed"}
      zIndex={100}
      width={"100%"}
      justify={"center"}
      background={"black"}
    >
      <ButtonGroup isAttached variant="outline" >
        {buttons.map((button) => (
          <Button
            key={button.path}
            onClick={() => navigate(button.path)}
            isActive={location.pathname === button.path}
            px={{ base: 2, md: 4 }}
            py={{ base: 1, md: 2 }}
          >
            {isMobile ? button.label : `${button.label} ${button.icon}`}
          </Button>
        ))}
      </ButtonGroup>
    </Flex>
  );
};

export default NavButtons;
