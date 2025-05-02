import { z } from "zod";

export const baseSongFormSchema = z.object({
  artist: z.string().min(1, "Artist is required."),
  title: z.string().min(1, "Artist is required."),
  fav: z.boolean(),
  blacklisted: z.boolean(),
  duet: z.boolean(),
  inNextEventList: z.boolean(),
  plays: z.number(),
});
export type BaseSongFormData = z.infer<typeof baseSongFormSchema>;

export const songsSangFormSchema = baseSongFormSchema.extend({
  location: z.string(),
  eventDate: z.date(),
});

export type SongsSangFormData = z.infer<typeof songsSangFormSchema>;

export type CheckboxGroup = "blacklisted" | "fav" | "inNextEventList" | "duet"

export type Option = {
  readonly label: string;
  readonly value: string;
}

