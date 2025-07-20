import { Box, Text } from "@chakra-ui/react";

const iconCircleSize = "70px";

export const IconCircle = () => {
  return (
    <Box
      aria-hidden="true"
      // border={"1px solid #4e4e4e"}
      position="absolute"
      top={`-${parseInt(iconCircleSize.replace('px', '')) / 2}px`}
      left="50%"
      transform="translateX(-50%)"
      boxSize={iconCircleSize} // Set both width and height for a perfect circle
      bg={"gray.700"}
      rounded="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1"
      boxShadow={"0px -1px 5px rgba(254, 254, 254, 0.877)"}
    >
      <Text fontSize="3xl" >🎤</Text>
    </Box>
  )
}
