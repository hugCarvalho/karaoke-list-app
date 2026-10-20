import { Button, ButtonGroup, Flex, Text } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

const NavButtons = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const buttons = [
    { label: "ADD", path: "/", icon: "➕" },
    { label: "LIST", path: "/list", icon: "📜" },
    { label: "INSPIRATION", path: "/search-song", icon: "👀" },
    { label: "HISTORY", path: "/history", icon: "📅" }, //🗞🗳🗃🗓🗂🗄🛎🎙🎚🎛🕰🛠🗡🛡🕳 📒📖
  ];
  return (
    <Flex
      as="nav"
      p={4}
      position={"fixed"}
      zIndex={100}
      width={"100%"}
      justify={"center"}
      background={"black"}
      aria-label="Main website navigation"
    >
      <ButtonGroup isAttached variant="solid" >
        {buttons.map((button) => {
          return <Button
            key={button.label}
            onClick={() => navigate(button.path)}
            variant={"solid"}
            color={pathname === button.path || (pathname === "/songs-sang" && button.label === "ADD") ? "orange" : "inherit"}
            px={{ base: 3, md: 4 }}
            py={{ base: 2, md: 2 }}
          >
            {`${button.label}`}
            <Text as="span" display={{ base: "none", md: "inline" }} fontSize="16px" paddingLeft="3px" aria-hidden="true">
              {` ${button.icon}`}
            </Text>
          </Button>
        })}
      </ButtonGroup>
    </Flex>
  );
};

export default NavButtons;
