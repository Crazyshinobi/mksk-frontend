import { api } from "./axios";
export const loginApi = async (payload: {
  email: string;
  password: string;
}) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};
