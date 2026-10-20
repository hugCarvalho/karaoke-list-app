// frontend/src/config/actions.ts
import { SortConfig } from "./formInterfaces";
import { Song } from "./interfaces";

export const ACTIONS = {
  sortList: (sortConfig: SortConfig, songs: Song[]) => {
    if (sortConfig.key === null) return songs;
    return [...songs].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortConfig.key === "lastSang") {
        // Derive timestamp from the latest event in song.events
        aVal = a.events && a.events.length > 0 ? new Date(a.events[a.events.length - 1].eventDate).getTime() : 0;
        bVal = b.events && b.events.length > 0 ? new Date(b.events[b.events.length - 1].eventDate).getTime() : 0;
      } else {
        aVal = a[sortConfig.key as keyof Song];
        bVal = b[sortConfig.key as keyof Song];
      }

      if (aVal < bVal) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }
};
