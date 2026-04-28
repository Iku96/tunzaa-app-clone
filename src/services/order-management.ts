import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Order } from "./types/orders";

// Order Management Types
export interface VendorOrdersResponse {
  items: Order[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetVendorOrdersParams {
  vendor_id: string;
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
  skip?: number;
  limit?: number;
}

export interface UpdateOrderStatusRequest {
  status:
    | "pending"
    | "processing"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded"
    | "partially_refunded";
}

export interface VendorResponseRequest {
  response: "accept" | "reject";
  notes?: string;
}

// OTP Verification Types
export interface OTPVerificationRequest {
  user_id: string;
  otp: string;
  purpose: "delivery_confirmation";
  metadata: {
    order_id: string;
    delivery_id: string;
    type: "delivery_confirmation";
  };
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  verified_at: string;
}

export const orderManagementApi = {
  // Get Single Order
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  // Get Vendor Orders
  getVendorOrders: async (
    params: GetVendorOrdersParams
  ): Promise<VendorOrdersResponse> => {
    const { vendor_id, ...queryParams } = params;
    const searchParams = new URLSearchParams();

    if (queryParams.status) {
      searchParams.append("status", queryParams.status);
    }
    if (queryParams.payment_status) {
      searchParams.append("payment_status", queryParams.payment_status);
    }
    if (queryParams.from_date) {
      searchParams.append("from_date", queryParams.from_date);
    }
    if (queryParams.to_date) {
      searchParams.append("to_date", queryParams.to_date);
    }
    if (queryParams.skip !== undefined) {
      searchParams.append("skip", queryParams.skip.toString());
    }
    if (queryParams.limit !== undefined) {
      searchParams.append("limit", queryParams.limit.toString());
    }

    const queryString = searchParams.toString();
    const url = queryString
      ? `/orders/vendor/${vendor_id}/orders?${queryString}`
      : `/orders/vendor/${vendor_id}/orders`;

    const response = await apiClient.get<VendorOrdersResponse>(url);
    return response.data;
  },

  // Update Order Status
  updateOrderStatus: async (
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<Order> => {
    const response = await apiClient.put<Order>(
      `/orders/${orderId}/status`,
      data
    );
    return response.data;
  },

  // Vendor Response (Accept/Reject Order)
  vendorResponse: async (
    orderId: string,
    vendorId: string,
    data: VendorResponseRequest
  ): Promise<Order> => {
    const response = await apiClient.post<Order>(
      `/orders/${orderId}/vendor/${vendorId}/response`,
      data
    );
    return response.data;
  },

  // OTP Verification for Delivery Confirmation
  verifyDeliveryOTP: async (
    data: OTPVerificationRequest
  ): Promise<OTPVerificationResponse> => {
    const response = await apiClient.post<OTPVerificationResponse>(
      "/otp/verify",
      data
    );
    return response.data;
  },
};

// React Query Hooks

export const useGetOrder = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderManagementApi.getOrder(orderId),
    enabled: enabled && !!orderId,
  });
};

export const useGetVendorOrders = (
  params: GetVendorOrdersParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["vendorOrders", params],
    queryFn: () => orderManagementApi.getVendorOrders(params),
    enabled: enabled && !!params.vendor_id,
  });
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateOrderStatusRequest;
    }) => orderManagementApi.updateOrderStatus(orderId, data),
  });
};

export const useVendorResponse = () => {
  return useMutation({
    mutationFn: ({
      orderId,
      vendorId,
      data,
    }: {
      orderId: string;
      vendorId: string;
      data: VendorResponseRequest;
    }) => orderManagementApi.vendorResponse(orderId, vendorId, data),
  });
};

export const useVerifyDeliveryOTP = () => {
  return useMutation({
    mutationFn: (data: OTPVerificationRequest) =>
      orderManagementApi.verifyDeliveryOTP(data),
  });
};
