import { useMutation } from "@tanstack/react-query";
import { closeEvent } from "../api/api";
import queryClient from "../config/queryClient";
import { QUERIES } from "../constants/queries";
import useAppToast from "./useAppToast";

export const useCloseEvent = () => {
  const { showSuccessToast, showErrorToast } = useAppToast();

  return useMutation({
    mutationFn: () => closeEvent(),
    onSuccess: () => {
      showSuccessToast("Event Closed.", "The event has been successfully closed.");
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    },
    onError: (error: Error) => {
      showErrorToast(
        "Error closing event.",
        error?.message || "An unexpected error occurred while closing the event."
      );
    },
  });
};
