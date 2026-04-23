export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  installments: Installment[];
}
