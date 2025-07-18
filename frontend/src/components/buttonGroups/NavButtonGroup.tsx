import { Button, ButtonGroup, Flex } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

const NavButtons = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const buttons = [
    { label: "ADD", path: "/", icon: "➕" },
    { label: "LIST", path: "/list", icon: "📜" },
    { label: "SEARCH", path: "/search-song", icon: "👀" },
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
            px={{ base: 1, md: 4 }}
            py={{ base: 1, md: 2 }}
          >
            {`${button.label}`}
            <span style={{ fontSize: "16px", paddingLeft: "3px" }} aria-hidden="true">
              {` ${button.icon}`}
            </span>
          </Button>
        })}
      </ButtonGroup>
    </Flex>
  );
};

export default NavButtons;
