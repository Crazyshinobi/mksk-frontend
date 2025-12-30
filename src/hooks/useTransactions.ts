import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransactionApi,
  fetchTransactionsApi,
  fetchTransactionByIdApi,
  deleteTransactionApi,
  CreateTransactionPayload,
  updateTransactionApi,
  fetchTransactionSlipApi,
  fetchCashbookApi,
  CashbookParams,
} from "../api/transactions.api";
import { toast } from "react-hot-toast";

// 🔹 CREATE TRANSACTION HOOK
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransactionApi(payload),
    onSuccess: () => {
      // Invalidate the cache to refresh the transactions list automatically
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction created successfully!");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message || "Failed to create transaction";
      toast.error(errorMsg);
    },
  });
};

// 🔹 FETCH ALL TRANSACTIONS HOOK
export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactionsApi,
  });
};

// 🔹 FETCH SINGLE TRANSACTION HOOK
export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => fetchTransactionByIdApi(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
};

// 🔹 DELETE TRANSACTION HOOK
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransactionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted successfully!");
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CreateTransactionPayload;
    }) => updateTransactionApi(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.id],
      });
      toast.success("Transaction updated successfully!");
    },
  });
};

export const useTransactionSlip = (id: number, type: "lender" | "borrower") => {
  return useQuery({
    queryKey: ["transactions", "slip", id, type],
    queryFn: () => fetchTransactionSlipApi(id, type),
    enabled: !!id,
  });
};

export const useCashbook = (params?: CashbookParams) => {
  return useQuery({
    queryKey: ["cashbook", params],
    queryFn: () => fetchCashbookApi(params),
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
};
