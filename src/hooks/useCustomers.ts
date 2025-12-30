import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCustomerApi,
  CreateCustomerPayload,
  deleteCustomerApi,
  toggleCustomerStatusApi,
} from "../api/customers.api";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomersApi } from "../api/customers.api";
import toast from "react-hot-toast";

export const useCreateCustomer = () => {
  return useMutation<any, Error, FormData | CreateCustomerPayload>({
    mutationFn: createCustomerApi,
  });
};

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomersApi,
  });
};

export const useToggleCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCustomerStatusApi,
    onSuccess: () => {
      // Refresh the customer list so the UI reflects the change
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer status updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer and documents deleted permanently");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete customer"
      );
    },
  });
};
