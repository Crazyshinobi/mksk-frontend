import { useMutation } from "@tanstack/react-query";
import { createCustomerApi } from "../api/customers.api";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomersApi } from "../api/customers.api";

export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: createCustomerApi,
  });
};

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomersApi,
  });
};