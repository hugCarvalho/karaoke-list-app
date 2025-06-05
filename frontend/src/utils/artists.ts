import { AxiosResponse } from "axios"
import { Option } from "../config/formInterfaces"
import { Artist } from "../config/interfaces"

export const getArtistsSelectData = (artistsDb: AxiosResponse<any, any>) => {
  if (!artistsDb?.data) return []

  return artistsDb?.data.map((artist: Artist) => {
    return { value: artist.name, label: artist.name }
  })
}

export const getSongsSelectData = (artistsDb: AxiosResponse<any, any>) => {
  if (!artistsDb?.data) return []

  return artistsDb.data.reduce((acc: Option[], artist: Artist) => {
    const songLabels = artist.songs.map(song => ({ value: song, label: song, artist: artist.name }));
    return [...acc, ...songLabels];
  }, [])
}

