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

export const addSong = async (data: Song) => {
  return API.post("/list/add", data)
};
export const addSangSong = async (data: Song) => {
  return API.post("/list/add-sang-song", data)
};
export const updateSong = async (data: { songId: string, value: boolean, type: CheckboxGroup }) => {
  return API.patch("/list/update", data)
};
export const deleteSong = async (data: { songId: string }) => {
  return API.delete(`/list/delete/${data.songId}`)
};
export const getArtistsDb = async () => {
  return API.get("/list/artists")
};
export const getEventsList = async (): Promise<KaraokeEvents[]> => {
  return API.get("/list/events")
};
export const updatePlayCount = async (data: { songId: string; artist: string; title: string }) => {
  console.log("updatePlayCount", data);
  return API.patch(`/list/update/songs/update-play/${data.songId}`, {
    artist: data.artist,
    title: data.title,
  });
}
//Events
export const createEvent = async (data: KaraokeEvents) => {
  return API.post("/list/add-event", data)
};
export const closeEvent = async () => {
  return API.post("/list/close-event", null)
};
