import API from "../config/apiClient";

export interface User {
  _id: string;
  email: string;
  verified: boolean;
  createdAt: Date | number;
  updatedAt: Date | number;
}

export const signup = async (data: { email: string, password: string, confirmPassword: string }) => {
  return API.post("/auth/register", data)
}
export const login = async (data: { email: string, password: string }) => {
  return API.post("/auth/login", data)
}
export const logout = async () => API.get("/auth/logout");

export const getUser = async (): Promise<User> => {
  return await API.get("/user") as User;
};
