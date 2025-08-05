import { Box, Button, Center, FormControl, FormErrorMessage, FormLabel, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form"; // Import Controller
import CreatableSelect from 'react-select/creatable';

import { getEventsList, getLocationsDb } from "../../api/api";
import PageHeader from "../../components/buttonGroups/Header";
import { EventCard } from "../../components/EventsCard";
import PageWrapper from "../../components/PageWrapper";
import { Data, KaraokeEvents } from "../../config/interfaces";
import { QUERIES } from "../../constants/queries";
import { useCloseEvent } from "../../hooks/useCloseEvent";
import { useCreateEvent } from "../../hooks/useCreateEvent";

interface OptionType {
  value: string;
  label: string;
}

type FormValues = {
  location: string;
};

const DEFAULT_LOCATION_VALUE = "Monster Ronson";
const DEFAULT_LOCATION_OPTION: OptionType = { value: DEFAULT_LOCATION_VALUE, label: DEFAULT_LOCATION_VALUE };

const defaultValues: FormValues = {
  location: DEFAULT_LOCATION_VALUE,
};

export const EventsHistory = () => {
  const { mutate: createEventMutation, isPending: isCreateEventPending, isSuccess: isCreateEventSuccess, reset: resetCreateEvent } = useCreateEvent();
  const { mutate: closeEventMutation, isPending: isCloseEventPending, isSuccess: isCloseEventSuccess, reset: resetCloseEvent } = useCloseEvent();

  const { data: eventsList, isLoading: isEventsLoading } = useQuery<Data["events"]>({
    queryKey: [QUERIES.GET_EVENTS_LIST],
    queryFn: getEventsList,
  });

  const { data: locationsDb, isLoading: isLocationsLoading, isError: isLocationsError, error: locationsError } = useQuery<string[]>({
    queryKey: [QUERIES.GET_LOCATIONS_DB],
    queryFn: getLocationsDb,
  });

  const { handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormValues>({ defaultValues });

  // State to hold all available options for CreatableSelect
  const [locationOptions, setLocationOptions] = useState<OptionType[]>(() => [DEFAULT_LOCATION_OPTION]);

  useEffect(() => {
    if (locationsDb) {
      const fetchedOptions = (locationsDb as string[]).map(loc => ({ value: loc, label: loc }));

      const uniqueOptionsMap = new Map<string, OptionType>();
      uniqueOptionsMap.set(DEFAULT_LOCATION_OPTION.value, DEFAULT_LOCATION_OPTION);

      fetchedOptions.forEach(option => {
        uniqueOptionsMap.set(option.value, option);
      });

      setLocationOptions(Array.from(uniqueOptionsMap.values()));

      if (!watch("location")) {
        setValue("location", DEFAULT_LOCATION_VALUE);
      }
    }
  }, [locationsDb, setValue, watch]);

  const isEventOpen = eventsList?.some((e: KaraokeEvents) => !e.closed) ?? false;

  useEffect(() => {
    if (isCreateEventSuccess) {
      resetCreateEvent();
    }
    if (isCloseEventSuccess) {
      resetCloseEvent();
    }
  }, [isEventOpen]);

  const onSubmit = async (data: FormValues) => {
    createEventMutation(data);
  };

  return (
    <PageWrapper>
      <PageHeader title="Performances" tooltipLabel="Lists all your performances and let's you create and close events. Once you create an event, you'll be able to add the songs you sang to it." />
      {
        isEventsLoading &&
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      }
      {/* OPEN EVENT */}
      {!isEventsLoading && !isEventOpen && (
        <VStack spacing={4} align="center" mb={8}>
          <Text fontSize="lg">You have no events open. Create one?</Text>
          <Box
            width={{ base: "100%", md: "50%", lg: "40%" }}
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormControl isInvalid={!!errors.location} isRequired>
                <FormLabel htmlFor="location">Location</FormLabel>
                <Controller
                  name="location"
                  control={control}
                  rules={{ required: "Location is required" }}
                  render={({ field }) => (
                    <CreatableSelect
                      {...field}
                      options={locationOptions}
                      value={locationOptions.find(option => option.value === field.value) || null}
                      isLoading={isLocationsLoading}
                      placeholder="Type or select a location"
                      isClearable
                      onCreateOption={(inputValue) => {
                        const newOption: OptionType = { value: inputValue, label: inputValue };

                        setLocationOptions(prev => {
                          const existingValues = new Set(prev.map(o => o.value));
                          if (!existingValues.has(newOption.value)) {
                            return [...prev, newOption];
                          }
                          return prev;
                        });
                        // Update react-hook-form's value and trigger validation
                        field.onChange(inputValue);
                      }}
                      onChange={(option) => {
                        field.onChange(option ? option.value : "");
                      }}
                      styles={{
                        container: (base) => ({
                          ...base,
                          minWidth: '150px',
                        }),
                        option: (base, state) => ({
                          ...base,
                          color: state.isSelected ? 'inherit' : 'gray',
                        }),
                      }}
                    />
                  )}
                />
                {errors.location && (
                  <FormErrorMessage>{errors.location.message}</FormErrorMessage>
                )}
              </FormControl>

              <Button
                type="submit"
                isLoading={isCreateEventPending || isEventsLoading || isLocationsLoading || isCreateEventSuccess}
                isDisabled={isCreateEventPending || isEventsLoading || isLocationsLoading || isCreateEventSuccess}
                mt={4}
                width="full"
              >
                Create Event
              </Button>
            </form>
          </Box>
        </VStack>
      )}
      {/* CLOSE EVENT */}
      {isEventOpen && (
        <VStack spacing={4} mb={10}>
          <Heading as="h2" size="md" color={"burlywood"}>Active Event</Heading>
          {eventsList?.map((event: KaraokeEvents) => {
            if (!event.closed) {
              return <EventCard key={event._id} event={event} showDeleteButton={true} />
            }
            return null
          })}
          <Button
            isLoading={isCloseEventPending || isEventsLoading || isCloseEventSuccess}
            isDisabled={isCloseEventPending || isEventsLoading || isCloseEventSuccess}
            onClick={() => closeEventMutation()}
            variant={"secondary"}
          >
            Close Event
          </Button>
        </VStack>
      )}
      {eventsList && eventsList.filter(event => event.closed).length > 0 && (
        <VStack spacing={2} align="stretch">
          <Heading size="lg" textAlign={"center"}>Events History</Heading>
          {eventsList?.map((event: KaraokeEvents) => {
            if (event.closed) {
              return <EventCard key={event._id} event={event} />
            }
            return null;
          }).reverse()}
        </VStack>
      )}
    </PageWrapper>
  )
}
