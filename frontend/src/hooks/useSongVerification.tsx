import { useState } from "react";
import { isDataVerified } from "../services/externalApi";
import useAppToast from "./useAppToast";

export const suggestionInitValue = { type: "" as "artist" | "song" | "", data: [] as string[] };
//const suggestionInitValue = { type: "", data: [] }
export function useSongVerification() {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [typoSuggestions, setTypoSuggestions] = useState(suggestionInitValue);
  const { showErrorToast } = useAppToast();

  /**
   * Verifies artist & song title.
   * Returns true if verification passed/valid, or false if invalid/error.
   */
  const verifyData = async (title: string, artist: string): Promise<boolean> => {
    setTypoSuggestions(suggestionInitValue);
    setIsVerifying(true);

    try {
      const res = await isDataVerified(title, artist);
      setIsVerifying(false);

      if (res?.verified === false) {
        if (res.type === "artist" || res.type === "song") {
          setTypoSuggestions({ type: res.type, data: res.suggestions });
        }
        return false; // Verification failed (suggestions found)
      }

      return true; // Verification passed
    } catch (verificationError) {
      setIsVerifying(false);
      showErrorToast("Verification failed.", "An unexpected error occurred during verification.");
      return false; // Error occurred
    }
  };

  const resetSuggestions = () => setTypoSuggestions(suggestionInitValue);

  return {
    isVerifying,
    typoSuggestions,
    verifyData,
    resetSuggestions,
    setTypoSuggestions,
  };
}
