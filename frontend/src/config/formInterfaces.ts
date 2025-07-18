import { z } from "zod";

export const baseSongFormSchema = z.object({
  artist: z.string().min(1, "Artist is required."),
  title: z.string().min(1, "Artist is required."),
  fav: z.boolean(),
  blacklisted: z.boolean(),
  duet: z.boolean(),
  inNextEventList: z.boolean(),
  notAvailable: z.boolean(),
  plays: z.number(),
});
export type BaseSongFormData = z.infer<typeof baseSongFormSchema>;

export type CheckboxGroup = "blacklisted" | "fav" | "inNextEventList" | "duet" | "notAvailable"

export type Option = {
  readonly label: string;
  readonly value: string;
  readonly artist?: string;
}

export type SortConfig = {
  key: "title" | "artist" | "plays"
  direction: "ascending" | "descending"
};
