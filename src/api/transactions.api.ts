import { api } from "./axios";
import { ApiResponse } from "./companies.api"; // Reusing your existing interface

export interface CreateTransactionPayload {
  company_id: number;
  transaction_type: "S" | "M";
  transaction_number_type: number;
  transaction_date: string;
  month: string;
  amount_in_thousands: number;
  a_p_status: "advanced" | "past";
  lender_ids: number[];
  borrower_ids: number[];
  interest_recieved?: number;
  interest_paid?: number;
  comission_percentage: number[];
  remarks?: string;
}

// 🔹 CREATE TRANSACTION
export const createTransactionApi = async (
  payload: CreateTransactionPayload
): Promise<ApiResponse<any>> => {
  try {
    console.log("🚀 [API Request] Creating Transaction:", payload);

    const { data } = await api.post("/transactions", payload);

    console.log("✅ [API Success] Transaction Created:", data);
    return data;
  } catch (error: any) {
    console.error("❌ [API Error] Create Transaction Failed:", {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status,
      details: error?.response?.data,
    });
    throw error;
  }
};

// 🔹 LIST TRANSACTIONS
export const fetchTransactionsApi = async (): Promise<ApiResponse<any[]>> => {
  try {
    const { data } = await api.get("/transactions");
    return data;
  } catch (error: any) {
    console.error("❌ [API Error] Fetch Transactions Failed:", error.message);
    throw error;
  }
};

// 🔹 GET SINGLE TRANSACTION
export const fetchTransactionByIdApi = async (
  id: number
): Promise<ApiResponse<any>> => {
  const { data } = await api.get(`/transactions/${id}`);
  return data;
};

// 🔹 DELETE TRANSACTION
export const deleteTransactionApi = async (
  id: number
): Promise<ApiResponse<any>> => {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
};

// 🔹 UPDATE TRANSACTION
export const updateTransactionApi = async (
  id: number,
  payload: CreateTransactionPayload
): Promise<ApiResponse<any>> => {
  const { data } = await api.patch(`/transactions/${id}`, payload);
  return data;
};

// 🔹 FETCH TRANSACTION SLIP DATA
export const fetchTransactionSlipApi = async (
  id: number,
  type: "lender" | "borrower"
) => {
  // This sends the type in the URL: /transactions/1/slip?type=lender
  const { data } = await api.get(`/transactions/${id}/slip`, {
    params: { type },
  });
  return data;
};

export interface CashbookParams {
  companyId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CashbookEntry {
  id: number;
  date: string;
  description: string;
  reference: string;
  receiving: number | "-";
  deduction: number | "-";
  balance: number;
}

export interface CashbookResponse {
  data: CashbookEntry[];
}

// API Functions
export const fetchCashbookApi = async (
  params?: CashbookParams
): Promise<CashbookResponse> => {
  console.group("📊 Cashbook API Call");
  console.log("Params:", params);

  // Clean params - remove undefined/null/empty values
  const cleanedParams: Record<string, string> = {};

  if (params?.companyId) {
    cleanedParams.companyId = params.companyId.toString();
  }
  if (params?.startDate) {
    cleanedParams.startDate = params.startDate;
  }
  if (params?.endDate) {
    cleanedParams.endDate = params.endDate;
  }

  console.log("Cleaned Params:", cleanedParams);

  try {
    const response = await api.get<CashbookResponse>("/transactions/cashbook", {
      params: cleanedParams,
    });
    console.log("✅ Response:", response.data);
    console.groupEnd();
    return response.data;
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
    console.groupEnd();
    throw error;
  }
};
