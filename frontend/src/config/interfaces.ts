export interface User {
  _id: string;
  email: string;
  verified: boolean;
  createdAt: Date | number;
  updatedAt: Date | number;
}

export interface Session {
  _id: string
  // userId: string,
  isCurrent: boolean
  userAgent: string
  createdAt: Date
  // expiresAt: Date
}

type EventData = {
  location: string,
  eventDate: string | null
}

export interface Song {
  songId: string,
  title: string,
  artist: string,
  fav: boolean,
  blacklisted: boolean,
  inNextEventList: boolean,
  duet: boolean
  events: EventData[],
  plays: number,
}

export interface Data {
  songs: Song[],
  userId: string,
  createdAt: string,
  updatedAt: string,
}

export interface Artist {
  name: string,
  songs: string[],
}
