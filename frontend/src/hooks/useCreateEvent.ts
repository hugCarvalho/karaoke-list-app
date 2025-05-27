import { useMutation } from "@tanstack/react-query";
import { createEvent } from "../api/api";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import useAppToast from "./useAppToast";

export const useCreateEvent = () => {
  const { showSuccessToast, showErrorToast } = useAppToast();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      showSuccessToast("Event Created.", "The event has been added to your list.");
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error creating event.",
        error?.message || "An unexpected error occurred while creating the event."
      );
    },
  });
};

