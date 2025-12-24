import { api } from "./axios";

export interface Company {
  id: number;
  companyName: string;
  companyDesc: string | null;
  createdAt: string;
}

export interface CreateCompanyPayload {
  companyName: string;
  companyDesc?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 🔹 CREATE
export const createCompanyApi = async (
  payload: CreateCompanyPayload
): Promise<ApiResponse<Company>> => {
  const { data } = await api.post("/companies", payload);
  return data;
};

// 🔹 LIST
export const fetchCompaniesApi = async (): Promise<ApiResponse<Company[]>> => {
  const { data } = await api.get("/companies");
  return data;
};
