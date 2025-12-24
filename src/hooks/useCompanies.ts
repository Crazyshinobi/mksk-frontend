import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCompanyApi, fetchCompaniesApi } from "../api/companies.api";

// 🔹 GET ALL
export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompaniesApi,
  });
};

// 🔹 CREATE
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompanyApi,
    onSuccess: () => {
      // 🔥 Auto refresh company list
      queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
};
