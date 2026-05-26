import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  CreateOrderBody,
  Order,
  GetOrdersResponse,
  GetOrdersParams,
  GetOrderTransactionsResponse,
} from "./types/orders";

export const ordersApi = {
  // Create Order
  createOrder: async (data: CreateOrderBody): Promise<Order> => {
    const response = await apiClient.post<Order>("orders/", data);
    return response.data;
  },

  // Get Buyer's Orders
  getOrders: async (
    params?: GetOrdersParams
  ): Promise<GetOrdersResponse | Order[]> => {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.append("status", params.status);
    }
    if (params?.payment_status) {
      searchParams.append("payment_status", params.payment_status);
    }
    if (params?.order_id) {
      searchParams.append("order_id", params.order_id);
    }
    if (params?.user_id) {
      searchParams.append("user_id", params.user_id);
    }
    if (params?.from_date) {
      searchParams.append("from_date", params.from_date);
    }
    if (params?.to_date) {
      searchParams.append("to_date", params.to_date);
    }
    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    const response = await apiClient.get<GetOrdersResponse | Order[]>(
      `orders/?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Single Order
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`orders/${orderId}`);
    return response.data;
  },

  // Get Order by Order Number
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`orders/by-number/${orderNumber}`);
    return response.data;
  },
  // Get Order Transactions
  getOrderTransactions: async (orderNumber: string): Promise<GetOrderTransactionsResponse> => {
    const response = await apiClient.get<GetOrderTransactionsResponse>(
      `orders/${orderNumber}/transactions`
    );
    return response.data;
  },
};

// React Query Hooks

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: ordersApi.createOrder,
  });
};

export const useGetOrders = (
  params?: GetOrdersParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.getOrders(params),
    enabled,
  });
};

export const useGetOrder = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: enabled && !!orderId,
  });
};

export const useGetOrderByNumber = (orderNumber: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["order-by-number", orderNumber],
    queryFn: () => ordersApi.getOrderByNumber(orderNumber),
    enabled: enabled && !!orderNumber,
  });
};

export const useGetOrderTransactions = (orderNumber: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["order-transactions", orderNumber],
    queryFn: () => ordersApi.getOrderTransactions(orderNumber),
    enabled: enabled && !!orderNumber,
  });
};
