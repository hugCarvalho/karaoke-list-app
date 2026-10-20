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
//SONG
export interface Song {
  artist: string,
  blacklisted: boolean,
  duet: boolean,
  events: SongEvents[],
  fav: boolean,
  inNextEventList: boolean,
  notAvailable: boolean,
  plays: number,
  songId: string,
  title: string,
}

type SongEvents = {
  _id: string,
  location: string,
  eventDate: string
}

//KARAOKE HISTORY EVENTS
export type KaraokeEvents = {
  _id: string,
  closed: boolean,
  eventDate: Date,
  location: string
  songs: EventHistorySong[] | [],
}
type EventHistorySong = {
  _id: string,
  artist: string,
  name: string
}

export interface Data {
  songs: Song[],
  userId: string,
  createdAt: string,
  updatedAt: string,
  events: KaraokeEvents[],
}

export interface Artist {
  name: string,
  songs: string[],
}


