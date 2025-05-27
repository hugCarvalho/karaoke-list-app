import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Center, Heading, IconButton, Tooltip } from "@chakra-ui/react";

type HeaderProps = {
  title: string;
  tooltipLabel: string;
};

const PageHeader = ({ title, tooltipLabel }: HeaderProps) => {
  return (
    <Center mb={4}>
      <Heading size="lg">{title}</Heading>
      {tooltipLabel && (
        <Tooltip label={tooltipLabel}>
          <IconButton
            aria-label={`Info about ${title}`}
            icon={<InfoOutlineIcon />}
            size="sm"
            variant="ghost"
          />
        </Tooltip>
      )}
    </Center>
  );
};

export default PageHeader;
