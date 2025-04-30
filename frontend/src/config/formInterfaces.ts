import { z } from "zod";

export const baseSongFormSchema = z.object({
  artist: z.string().min(1, "Artist is required."),
  title: z.string().min(1, "Artist is required."),
  fav: z.boolean(),
  blacklisted: z.boolean(),
  inNextEventList: z.boolean(),
  plays: z.number(),
});

export type BaseSongFormData = z.infer<typeof baseSongFormSchema>;
