import { api } from "./axios";
import { ApiResponse } from "./companies.api"; // Reusing your existing interface

export interface CreateCustomerPayload {
  isBorrower: boolean;
  isLender: boolean;
  fullName: string;
  emailAddress: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  panNumber?: string;
  aadharNumber?: string;
  address?: string;
  companyId: number;
  businessName?: string;
  gstNumber?: string;
  businessAddress?: string;
  natureOfBusiness?: string;
  typeOfBusiness?: string;
  companyPanNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  city?: string;
  accountHolderName?: string;
  panCardDoc?: string;
  aadharDoc?: string;
  companyPanDoc?: string;
  visitingCardDoc?: string;
}

export const createCustomerApi = async (
  payload: CreateCustomerPayload
): Promise<ApiResponse<any>> => {
  try {
    console.log("🚀 [API Request] Creating Customer:", payload);

    const { data } = await api.post("/customers", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ [API Success] Customer Created:", data);
    return data;
  } catch (error: any) {
    // Detailed error logging
    console.error("❌ [API Error] Create Customer Failed:", {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status,
      details: error?.response?.data,
    });

    // We throw the error so that useMutation's onError handler is triggered
    throw error;
  }
};

// 🔹 LIST CUSTOMERS
export const fetchCustomersApi = async (): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get("/customers");
  console.log(data);
  return data;
};
