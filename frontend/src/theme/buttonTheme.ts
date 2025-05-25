import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const customPrimary = defineStyle({
  color: "white",
  bg: "theme.primary",
  _hover: {
    bg: "theme.primaryDark",
    _disabled: {
      bg: "theme.primaryDark",
    },
  },
});

const customSecondary = {
  bg: "red.500",
  color: "white",
  _hover: {
    bg: "red.600",
    _disabled: {
      bg: "red.600",
    },
  },
}

const buttonTheme = defineStyleConfig({
  variants: {
    primary: customPrimary,
    secondary: customSecondary
  },
  defaultProps: {
    variant: "primary",
  },
});

export default buttonTheme;
