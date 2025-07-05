import { Button, ButtonGroup, Flex } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

const NavButtons = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // const [isMobile] = useMediaQuery("(max-width: 768px)");

  const buttons = [
    { label: "ADD", path: "/", icon: "➕" },
    { label: "LIST", path: "/list", icon: "📜" }, // 🗒🗓📜📃📑
    { label: "SEARCH", path: "/search-song", icon: "🕰" }, // 🗒🗓📜📃📑
    { label: "HISTORY", path: "/history", icon: "📅" }, //🗞🗳🗃🗓🗂🗄🛎🎙🎚🎛🕰🛠🗡🛡🕳 📒📖
    // { label: "Fav", path: "/favourites", icon: "⭐" },
    // { label: "Blacklist", path: "/blacklist", icon: "🚫" },
    // { label: "Duet", path: "/duet", icon: "🎤" },
    // { label: "Next", path: "/next-event-list", icon: "⏭️" },
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
            color={pathname === button.path || (pathname === "/songs-sang" && button.label === "ADD") ? "orange" : "inherit"} //TODO: decide wether to use path or state and update/fix code
            px={{ base: 2, md: 4 }}
            py={{ base: 1, md: 2 }}
          >
            {`${button.label}`}
            <span style={{ fontSize: "16px", paddingLeft: "5px" }} aria-hidden="true">
              {` ${button.icon}`}
            </span>
          </Button>
        })}
      </ButtonGroup>
    </Flex>
  );
};

export default NavButtons;
