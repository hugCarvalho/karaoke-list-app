import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import NavButtonGroup from "./NavButtonGroup";
import UserMenu from "./UserMenu";

const AppContainer = () => {

  return (
    <Box display={"flex"} flexDirection={"column"} flex={1}>
      <NavButtonGroup />
      <UserMenu />
      <Outlet />
    </Box>
  );
};
export default AppContainer;
