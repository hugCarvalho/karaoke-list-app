import API from "../config/apiClient";
import { Song } from "../config/interfaces";

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

export const signup = async (data: { email: string, password: string, confirmPassword: string }) => {
  return API.post("/auth/register", data)
}
export const login = async (data: { email: string, password: string }) => {
  return API.post("/auth/login", data)
}
export const logout = async () => API.get("/auth/logout");

export const verifyEmail = async (verificationCode: string) => {
  console.log("VERIFY", verificationCode)
  return API.get(`/auth/email/verify/${verificationCode}`);
}
export const sendPasswordResetEmail = async (email: string) =>
  API.post("/auth/password/forgot", { email });
export const resetPassword = async ({ verificationCode, password }: { verificationCode: string, password: string }) => {
  console.log("VER", verificationCode)
  console.log("PASS", password)
  API.post("/auth/password/reset", { verificationCode, password });
}
export const getUser = async (): Promise<User> => {
  return await API.get("/user") as User;
};
export const getSessions = async () => API.get("/sessions");

export const deleteSession = async (id: string) => API.delete(`/sessions/${id}`);

export const getSongsList = async (): Promise<Song[]> => API.get("/list");
export const addSong = async (data: Song) => {
  console.log("first", data)
  API.post("/list/add", data)
};
export const updateSong = async (data: { songId: string, value: boolean, type: "blacklisted" | "fav" | "inNextEventList" }) => {
  API.patch("/list/update", data)
};
export const deleteSong = async (data: { songId: string }) => {
  API.delete(`/list/delete/${data.songId}`)
};
