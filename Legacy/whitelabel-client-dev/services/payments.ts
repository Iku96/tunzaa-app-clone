import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  InitiatePaymentBody,
  InitiatePaymentDirectlyBody,
  InitiatePaymentResponse,
  PaymentStatusResponse,
  CreateInstallmentPlanBody,
  InstallmentPlanResponse,
  UpdateInstallmentPlanBody,
} from "./types/payments";

export const paymentsApi = {
  // Initiate Payment
  initiatePayment: async (
    orderId: string,
    data: InitiatePaymentBody
  ): Promise<any> => {
    console.log("Initiate payment request:", JSON.stringify(data, null, 2));
    const response = await apiClient.post<any>(
      `orders/${orderId}/pay`,
      data
    );
    console.log("Initiate payment response:", JSON.stringify(response.data, null, 2));
    return response.data;
  },

  // Initiate Payment Directly
  initiatePaymentDirectly: async (
    data: InitiatePaymentDirectlyBody
  ): Promise<any> => {
    const response = await apiClient.post<any>(
      `payments/initiate-payment`,
      data
    );
    return response.data;
  },

  // Check Payment Status
  checkPaymentStatus: async (
    transactionId: string
  ): Promise<PaymentStatusResponse> => {
    const response = await apiClient.get<PaymentStatusResponse>(
      `payments/check-status/${transactionId}`
    );
    return response.data;
  },

  // Create Installment Plan
  createInstallmentPlan: async (
    data: CreateInstallmentPlanBody
  ): Promise<InstallmentPlanResponse> => {
    const response = await apiClient.post<InstallmentPlanResponse>(
      "payments/installments/create",
      data
    );
    return response.data;
  },

  // Get Payment Plan
  getInstallmentPlan: async (
    planId: number
  ): Promise<InstallmentPlanResponse> => {
    const response = await apiClient.get<InstallmentPlanResponse>(
      `payments/installments/${planId}`
    );
    return response.data;
  },

  // Update Payment Plan
  updateInstallmentPlan: async (
    planId: number,
    data: UpdateInstallmentPlanBody
  ): Promise<InstallmentPlanResponse> => {
    const response = await apiClient.put<InstallmentPlanResponse>(
      `payments/installments/${planId}/update`,
      data
    );
    return response.data;
  },

  // Cancel Plan
  cancelInstallmentPlan: async (planId: number): Promise<void> => {
    await apiClient.delete(`payments/installments/${planId}/cancel`);
  },
};

// React Query Hooks

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: InitiatePaymentBody }) =>
      paymentsApi.initiatePayment(orderId, data),
  });
};

export const useInitiatePaymentDirectly = () => {
  return useMutation({
    mutationFn: (data: InitiatePaymentDirectlyBody) =>
      paymentsApi.initiatePaymentDirectly(data),
  });
};

export const useCheckPaymentStatus = (
  transactionId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["paymentStatus", transactionId],
    queryFn: () => {
      return paymentsApi.checkPaymentStatus(transactionId);
    },
    enabled: enabled && !!transactionId,
    refetchInterval: 6000, // Poll every 6 seconds
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: 2000,
  });
};

export const useCreateInstallmentPlan = () => {
  return useMutation({
    mutationFn: paymentsApi.createInstallmentPlan,
  });
};

export const useGetInstallmentPlan = (
  planId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["installmentPlan", planId],
    queryFn: () => paymentsApi.getInstallmentPlan(planId),
    enabled: enabled && !!planId,
  });
};

export const useUpdateInstallmentPlan = () => {
  return useMutation({
    mutationFn: ({
      planId,
      data,
    }: {
      planId: number;
      data: UpdateInstallmentPlanBody;
    }) => paymentsApi.updateInstallmentPlan(planId, data),
  });
};

export const useCancelInstallmentPlan = () => {
  return useMutation({
    mutationFn: paymentsApi.cancelInstallmentPlan,
  });
};
