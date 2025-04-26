type EventData = {
  location: string,
  eventDate: Date | null
}

export type Song = {
  songId: string,
  title: string,
  artist: string,
  fav: boolean,
  blacklisted: boolean,
  inNextEventList: boolean,
  events: EventData[],
  plays: number,
}

export interface Data {
  songs: Song[],
  userId: string,
  createdAt: string,
  updatedAt: string,
}
