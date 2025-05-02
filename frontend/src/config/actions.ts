import { SortConfig } from "./formInterfaces";
import { Song } from "./interfaces";

export const ACTIONS = {
  sortList: (sortConfig: SortConfig, songs: Song[]) => {
    if (sortConfig.key !== null) {
      songs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return songs;
  }
}
