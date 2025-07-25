import API from "../config/apiClient";
import { CheckboxGroup } from "../config/formInterfaces";
import { KaraokeEvents, Song, User } from "../config/interfaces";

export const signup = async (data: { email: string, password: string, confirmPassword: string }) => {
  return API.post("/auth/register", data)
}
export const login = async (data: { email: string, password: string }) => {
  return API.post("/auth/login", data)
}
export const logout = async () => API.get("/auth/logout");

export const verifyEmail = async (verificationCode: string) => {
  return API.get(`/auth/email/verify/${verificationCode}`);
}
export const sendPasswordResetEmail = async (email: string) =>
  API.post("/auth/password/forgot", { email });
export const resetPassword = async ({ verificationCode, password }: { verificationCode: string, password: string }) => {
  API.post("/auth/password/reset", { verificationCode, password });
}
export const getUser = async (): Promise<User> => {
  return await API.get("/user") as User;
};
export const getSessions = async () => API.get("/sessions");

export const deleteSession = async (id: string) => API.delete(`/sessions/${id}`);

export const getSongsList = async (): Promise<Song[]> => API.get("/list");

export const getArtistsDb = async () => {
  return API.get("/list/artists")
};
export const addSong = async (data: Song) => {
  return API.post("/list/add", data)
};
export const addSangSong = async (data: Song) => {
  return API.post("/list/add-sang-song", data)
};
export const updateSongListTypes = async (data: { songId: string, value: boolean, type: CheckboxGroup }) => {
  return API.patch("/list/update", data)
};
export const updatePlayCount = async (data: { songId: string; artist: string; title: string }) => {
  return API.patch(`/list/update/songs/update-play/${data.songId}`, {
    artist: data.artist,
    title: data.title,
  });
}
export const deleteSong = async (data: { songId: string }) => {
  return API.delete(`/list/delete/${data.songId}`)
};
export const deleteSongFromCurrentEvent = (data: { songId: string }) => {
  return API.delete(`/list/events/current/songs/${data.songId}`)
};
//Events
export const getEventsList = async (): Promise<KaraokeEvents[]> => {
  return API.get("/events/events")
};
export const createEvent = async (payload: { location: string }) => {
  return API.post("/events/add-event", payload)
};
export const closeEvent = async () => {
  return API.post("/events/close-event", null)
};
//Locations
export const getLocationsDb = async (): Promise<string[]> => {
  return API.get("/events/locations")
};
