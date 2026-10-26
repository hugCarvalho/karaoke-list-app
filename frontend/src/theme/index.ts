//frontend/src/theme/index.ts
import { baseTheme, extendTheme } from "@chakra-ui/react";
import buttonTheme from "./buttonTheme";
import linkTheme from "./linkTheme";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
  theme: {
    primary: baseTheme.colors.blue[500],
    primaryDark: baseTheme.colors.blue[600],
  },
  text: {
    muted: baseTheme.colors.gray[400],
  },
};

const theme = extendTheme({
  config,
  colors,
  components: {
    Button: buttonTheme,
    Link: linkTheme,
  },
  styles: {
    global: {
      "html, body, #root": {
        backgroundColor: "#19202c", // Matches your dark theme and meta theme-color
        // color: "white",
        // minHeight: "100vh",
        minHeight: "100dvh", // Dynamic viewport units for modern mobile devices
        margin: 0,
        padding: 0,
        // Prevents content from colliding with the mobile gesture/navigation bar
        paddingBottom: "env(safe-area-inset-bottom)",
      },
    },
  },
});

export default theme;
