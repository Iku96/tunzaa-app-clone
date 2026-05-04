import { create } from "zustand";
import { format, addDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ordersApi,
  Order as ApiOrder,
  OrdersResponse,
} from "@/src/services/orders";
import { useAuth } from "@/context/auth";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  type: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: OrderStatus;
  paymentMethod: "tunzaa" | "mobile_money";
  paymentStatus: "pending" | "completed" | "failed";
  tunzaaPayments?: Array<{
    installmentNumber: number;
    amount: number;
    dueDate: string;
    status: "pending" | "completed" | "failed";
  }>;
  createdAt: string;
  estimatedDelivery: string;
}

interface OrdersState {
  orders: Order[];
  selectedFilter: "history" | "ongoing" | "scheduled";
  isLoading: boolean;
  error: string | null;
  setFilter: (filter: "history" | "ongoing" | "scheduled") => void;
  getFilteredOrders: (apiOrders?: ApiOrder[]) => Order[];
  getOrderById: (id: string, apiOrders?: ApiOrder[]) => Order | undefined;
}

// Mock orders data for backward compatibility
const mockOrders: Order[] = [
  {
    id: "ORD-2025-001",
    userId: "1",
    type: "regular",
    items: [{ productId: 1001, quantity: 2, price: 74500 }],
    total: 149000,
    status: "completed",
    paymentMethod: "mobile_money",
    paymentStatus: "completed",
    createdAt: format(addDays(new Date(), -7), "yyyy-MM-dd"),
    estimatedDelivery: format(addDays(new Date(), -4), "yyyy-MM-dd"),
  },
  {
    id: "ORD-2025-002",
    userId: "1",
    type: "tunzaa",
    items: [{ productId: 1002, quantity: 1, price: 42300 }],
    total: 42300,
    status: "processing",
    paymentMethod: "tunzaa",
    paymentStatus: "pending",
    tunzaaPayments: [
      {
        installmentNumber: 1,
        amount: 14100,
        dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
        status: "pending",
      },
      {
        installmentNumber: 2,
        amount: 14100,
        dueDate: format(addDays(new Date(), 37), "yyyy-MM-dd"),
        status: "pending",
      },
      {
        installmentNumber: 3,
        amount: 14100,
        dueDate: format(addDays(new Date(), 67), "yyyy-MM-dd"),
        status: "pending",
      },
    ],
    createdAt: format(addDays(new Date(), -1), "yyyy-MM-dd"),
    estimatedDelivery: format(addDays(new Date(), 3), "yyyy-MM-dd"),
  },
  {
    id: "ORD-2025-003",
    userId: "1",
    type: "tunzaa",
    items: [{ productId: 1004, quantity: 2, price: 25000 }],
    total: 50000,
    status: "pending",
    paymentMethod: "tunzaa",
    paymentStatus: "pending",
    tunzaaPayments: [
      {
        installmentNumber: 1,
        amount: 16667,
        dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
        status: "pending",
      },
      {
        installmentNumber: 2,
        amount: 16667,
        dueDate: format(addDays(new Date(), 37), "yyyy-MM-dd"),
        status: "pending",
      },
      {
        installmentNumber: 3,
        amount: 16666,
        dueDate: format(addDays(new Date(), 67), "yyyy-MM-dd"),
        status: "pending",
      },
    ],
    createdAt: format(addDays(new Date(), -1), "yyyy-MM-dd"),
    estimatedDelivery: format(addDays(new Date(), 3), "yyyy-MM-dd"),
  },
];

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: mockOrders,
  selectedFilter: "ongoing",
  isLoading: false,
  error: null,

  setFilter: (filter) => {
    set({ selectedFilter: filter });
  },

  // If apiOrders is provided, use it, otherwise fallback to mockOrders
  getFilteredOrders: (apiOrders?: ApiOrder[]) => {
    const { selectedFilter } = get();
    const today = new Date();
    let ordersToUse: any[] = apiOrders || get().orders;

    // If using API orders, map to local Order type for filtering
    if (apiOrders) {
      ordersToUse = apiOrders.map((o) => ({
        id: o.order_id,
        userId: o.user_id,
        type: "regular", // fallback/default type
        items: o.items.map((item) => ({
          productId: Number(item.product_id),
          quantity: item.quantity,
          price: item.unit_price,
        })),
        total: o.totals.total,
        status: o.status as OrderStatus,
        paymentMethod:
          o.payment_details.method === "tunzaa" ? "tunzaa" : "mobile_money",
        paymentStatus: o.payment_status as "pending" | "completed" | "failed",
        tunzaaPayments: undefined, // You can map this if needed
        createdAt: o.created_at,
        estimatedDelivery: o.created_at, // You can map this if needed
      }));
    }

    switch (selectedFilter) {
      case "history":
        return ordersToUse.filter(
          (order) =>
            order.status === "completed" || order.status === "cancelled"
        );
      case "ongoing":
        return ordersToUse.filter(
          (order) => order.status === "processing" || order.status === "pending"
        );
      case "scheduled":
        return ordersToUse.filter(
          (order) => new Date(order.estimatedDelivery) > today
        );
      default:
        return ordersToUse;
    }
  },
  getOrderById: (id: string, apiOrders?: ApiOrder[]) => {
    let ordersToUse: any[] = apiOrders || get().orders;
    if (apiOrders) {
      ordersToUse = apiOrders.map((o) => ({
        id: o.order_id,
        userId: o.user_id,
        type: "regular", // fallback/default type
        items: o.items.map((item) => ({
          productId: Number(item.product_id),
          quantity: item.quantity,
          price: item.unit_price,
        })),
        total: o.totals.total,
        status: o.status as OrderStatus,
        paymentMethod:
          o.payment_details.method === "tunzaa" ? "tunzaa" : "mobile_money",
        paymentStatus: o.payment_status as "pending" | "completed" | "failed",
        tunzaaPayments: undefined, // You can map this if needed
        createdAt: o.created_at,
        estimatedDelivery: o.created_at, // You can map this if needed
      }));
    }
    return ordersToUse.find((p) => p.id === id);
  },
}));

// React Query hooks for the new API
export const useOrders = () => {
  const { user } = useAuth();
  return useQuery<OrdersResponse>({
    queryKey: ["orders", user?.id],
    queryFn: () => ordersApi.getUserOrders(user?.id || ""),
    enabled: !!user?.id,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery<ApiOrder>({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
