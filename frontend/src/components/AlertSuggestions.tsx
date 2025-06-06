import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Stack } from "@chakra-ui/react";
import { UseFormSetValue } from "react-hook-form";

type Option = { value: string; label: string; }

type AlertSuggestionsProps = {
  type: "artist" | "song";
  suggestions: string[];
  setValue: UseFormSetValue<any>;
  setArtistOptionValue: (option: Option | null) => void;
  setSongOptionValue: (option: Option | null) => void;
};

export const AlertSuggestions = ({ type, suggestions, setValue, setArtistOptionValue, setSongOptionValue }: AlertSuggestionsProps) => {
  if (suggestions.length === 0) { return null; }
  console.log('%c AlertSuggestions.tsx - line: 17', 'color: white; background-color: #f58801;', suggestions, '<-suggestions')
  return (
    <Box as="section" pb={4} justifyContent={"center"} display={"flex"} >
      <Alert status="warning" variant="top-accent" flexDirection={"column"} rounded={"md"} maxWidth={"xl"}>
        <AlertIcon />
        <AlertTitle mb={2} textAlign={"center"} fontSize={"sm"}> {type === "artist" ? "Artist" : "Song"} could not be verified. Did you mean?</AlertTitle>
        <AlertDescription
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          mx="auto"
        >
          <Stack direction="row" spacing={2} justifyContent={"center"} flexWrap={"wrap"} >
            {suggestions.map((item) => {
              return <Button key={item} variant="solid" padding={1} size={"xs"} colorScheme="green"
                onClick={() => {
                  if (type === "artist") {
                    setArtistOptionValue({ value: item, label: item })
                    setValue("artist", item)
                  }
                  if (type === "song") {
                    setSongOptionValue({ value: item, label: item })
                    setValue("title", item)
                  }
                }}
                type="submit"
              >
                {item}
              </Button>
            })}
          </Stack>
        </AlertDescription>
      </Alert>
    </Box>
  );
};
