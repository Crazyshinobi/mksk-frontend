// src/hooks/usePaymentAllocation.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  recordAllocationApi, 
  fetchSlipAllocationsApi, 
  PaymentAllocationPayload 
} from '../api/payment-allocations.api';

export const usePaymentAllocation = () => {
  const queryClient = useQueryClient();

  // 1. Mutation to record a new allocation
  const recordAllocation = useMutation({
    mutationFn: (payload: PaymentAllocationPayload) => recordAllocationApi(payload),
    onSuccess: () => {
      toast.success('Payment allocated successfully');
      // Invalidate queries to refresh the ledger and slip balances
      queryClient.invalidateQueries({ queryKey: ['slip-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to record allocation';
      toast.error(message);
    },
  });

  // 2. Query to fetch allocations for a specific slip
  const useSlipAllocations = (slipId: number) => {
    return useQuery({
      queryKey: ['slip-allocations', slipId],
      queryFn: () => fetchSlipAllocationsApi(slipId),
      enabled: !!slipId, // Only run if a slip ID is provided
    });
  };

  return {
    mutateAllocation: recordAllocation.mutate,
    isAllocating: recordAllocation.isPending,
    useSlipAllocations,
  };
};