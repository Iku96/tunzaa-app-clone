// Order Management API Types

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code?: string;
  country: string;
  phone: string;
  email: string;
  is_default: boolean;
  lat?: string; // Optional: delivery location latitude
  lng?: string; // Optional: delivery location longitude
  latitude?: string; // Optional: delivery location latitude
  longitude?: string; // Optional: delivery location longitude
}

export interface DeliveryDetails {
  partner_id: string;
  cost: number;
}

export interface PaymentDetails {
  method: string;
  amount: number;
  currency: string;
  payment_gateway: string;
  notes?: string;
}

export interface CreateOrderBody {
  cart_id: string;
  shipping_address: ShippingAddress;
  delivery_details: DeliveryDetails;
  payment_details: PaymentDetails;
  user_id: string;
  delivery_type_id: string;
  notes?: string;
}

export interface OrderItem {
  item_id: string;
  product_id: string;
  variant_id?: string | null;
  vendor_id: string;
  store_id?: string | null;
  store?: any | null;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  discounted_subtotal?: number;
  tax: number;
  total: number;
  commission_rate: string;
  refunded_quantity: number;
  refunded_amount: number;
  category_ids?: string[];
  categories?: any[];
  metadata?: any | null;
}

export interface OrderTotals {
  subtotal: number;
  discounted_subtotal?: number;
  discount: number;
  item_discounts?: number;
  order_level_discount?: number;
  total_discount?: number;
  tax: number;
  shipping?: number;
  total: number;
}

export interface OrderPaymentDetails {
  payment_id?: string;
  method: string;
  status?: string;
  amount: number;
  currency: string;
  transaction_id: string;
  payment_gateway: string;
  paid_at?: string | null;
  notes?: string;
  metadata?: any | null;
}

export interface OrderRefund {
  refund_id: string;
  amount: number;
  reason: string;
  status: string;
  items: any[];
  issued_by: string;
  created_at: string;
}

export interface Order {
  _id?: string;
  order_id: string;
  order_number: string;
  tenant_id: string;
  user_id: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  totals: OrderTotals;
  currency: string;
  discount_code?: string | null;
  vendor_responses?: Record<string, any>;
  status: string;
  payment_status: string;
  payment_details: OrderPaymentDetails;
  refunds: OrderRefund[];
  created_at: string;
  updated_at: string;
  paid_at?: string | null;
  fulfilled_at?: string | null;
  cancelled_at?: string | null;
  notes?: string;
  metadata?: any | null;
}

export interface GetOrdersResponse {
  items: Order[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetOrdersParams {
  status?: string;
  payment_status?: string;
  order_id?: string;
  user_id?: string;
  from_date?: string;
  to_date?: string;
  skip?: number;
  limit?: number;
}
