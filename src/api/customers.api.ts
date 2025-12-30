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

// Update the payload type to accept FormData or the Interface
export const createCustomerApi = async (
  payload: FormData | CreateCustomerPayload
): Promise<ApiResponse<any>> => {
  try {
    // Note: When logging FormData, use console.log(Object.fromEntries(payload)) to see content
    console.log("🚀 [API Request] Creating Customer via FormData");

    const { data } = await api.post("/customers", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ [API Success] Customer Created:", data);
    return data;
  } catch (error: any) {
    console.error("❌ [API Error] Create Customer Failed:", {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status,
      details: error?.response?.data,
    });
    throw error;
  }
};
// 🔹 LIST CUSTOMERS
export const fetchCustomersApi = async (): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get("/customers");
  console.log(data);
  return data;
};

// 🔹 TOGGLE CUSTOMER STATUS
export const toggleCustomerStatusApi = async (
  id: number
): Promise<ApiResponse<any>> => {
  try {
    const { data } = await api.patch(`/customers/${id}/status`);
    return data;
  } catch (error: any) {
    console.error("❌ [API Error] Toggle Status Failed:", error.message);
    throw error;
  }
};

export const deleteCustomerApi = async (
  id: number
): Promise<ApiResponse<any>> => {
  const { data } = await api.delete(`/customers/${id}`);
  return data;
};
