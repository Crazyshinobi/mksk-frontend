import { api } from "./axios";

export interface PaymentAllocationPayload {
  payment_id: number;
  from_slip_id?: number;
  to_slip_id: number;
  allocated_amount: number;
  allocation_type: 'direct' | 'carry_forward' | 'priority' | 'manual';
  remarks?: string;
}

export const recordAllocationApi = async (payload: PaymentAllocationPayload) => {
  const { data } = await api.post("/payment-allocations", payload);
  return data;
};

export const fetchSlipAllocationsApi = async (slipId: number) => {
  const { data } = await api.get(`/payment-allocations/slip/${slipId}`);
  return data;
};