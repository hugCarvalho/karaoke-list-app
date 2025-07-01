import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MouseEventHandler } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/api";

const UserMenu = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: signOut } = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  const handleSignOut: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    signOut()
  };

  return (
    <Menu isLazy placement="right-start">
      <MenuButton position="absolute" right={{ "base": 3, md: 100 }} top={{ "base": 6, md: 7 }} zIndex={100}>
        <Avatar size={"xs"} src="#" />
      </MenuButton>
      <MenuList>
        {/* <MenuItem onClick={() => navigate("/")}>Profile</MenuItem> */}
        <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
        <MenuItem onClick={() => navigate("/statistics")}>Statistics</MenuItem>
        <MenuItem onClick={handleSignOut}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
