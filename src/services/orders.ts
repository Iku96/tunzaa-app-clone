import { apiClient } from './client';
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
    lat?: string;
    lng?: string;
    latitude?: string;
    longitude?: string;
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
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    commission_rate: string;
    refunded_quantity: number;
    refunded_amount: number;
}

export interface OrderTotals {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
}

export interface OrderPaymentDetails {
    method: string;
    amount: number;
    currency: string;
    transaction_id: string;
    payment_gateway: string;
}

export interface Order {
    order_id: string;
    order_number: string;
    tenant_id: string;
    user_id: string;
    items: OrderItem[];
    shipping_address: ShippingAddress;
    totals: OrderTotals;
    currency: string;
    status: string;
    payment_status: string;
    payment_details: OrderPaymentDetails;
    created_at: string;
    updated_at: string;
}

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

export interface GetOrdersResponse {
    items: Order[];
    total: number;
    skip: number;
    limit: number;
}

export const orderApi = {
    getVendorOrders: async (params: GetVendorOrdersParams): Promise<VendorOrdersResponse> => {
        const { vendor_id, ...queryParams } = params;
        const searchParams = new URLSearchParams();

        if (queryParams.status) searchParams.append("status", queryParams.status);
        if (queryParams.payment_status) searchParams.append("payment_status", queryParams.payment_status);
        if (queryParams.from_date) searchParams.append("from_date", queryParams.from_date);
        if (queryParams.to_date) searchParams.append("to_date", queryParams.to_date);
        if (queryParams.skip !== undefined) searchParams.append("skip", queryParams.skip.toString());
        if (queryParams.limit !== undefined) searchParams.append("limit", queryParams.limit.toString());

        const queryString = searchParams.toString();
        const url = queryString
            ? `/orders/vendor/${vendor_id}/orders?${queryString}`
            : `/orders/vendor/${vendor_id}/orders`;

        const response = await apiClient.get<VendorOrdersResponse>(url);
        return response.data;
    },

    createOrder: async (data: CreateOrderBody): Promise<Order> => {
        const response = await apiClient.post<Order>("/orders/", data);
        return response.data;
    },

    getOrders: async (params?: GetOrdersParams): Promise<GetOrdersResponse | Order[]> => {
        const searchParams = new URLSearchParams();

        if (params?.status) searchParams.append("status", params.status);
        if (params?.payment_status) searchParams.append("payment_status", params.payment_status);
        if (params?.order_id) searchParams.append("order_id", params.order_id);
        if (params?.user_id) searchParams.append("user_id", params.user_id);
        if (params?.from_date) searchParams.append("from_date", params.from_date);
        if (params?.to_date) searchParams.append("to_date", params.to_date);
        if (params?.skip !== undefined) searchParams.append("skip", params.skip.toString());
        if (params?.limit !== undefined) searchParams.append("limit", params.limit.toString());

        const response = await apiClient.get<GetOrdersResponse | Order[]>(
            `/orders/?${searchParams.toString()}`
        );
        return response.data;
    },
    /** Get orders for a specific user (buyer view) */
    getUserOrders: async (
        userId: string,
        params?: { status?: string; skip?: number; limit?: number }
    ): Promise<GetOrdersResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append("status", params.status);
        if (params?.skip !== undefined) searchParams.append("skip", params.skip.toString());
        if (params?.limit !== undefined) searchParams.append("limit", params.limit.toString());

        const queryString = searchParams.toString();
        const url = queryString
            ? `/orders/user/${userId}?${queryString}`
            : `/orders/user/${userId}`;

        const response = await apiClient.get<GetOrdersResponse>(url);
        return response.data;
    },

    /** Pay for an order by order number */
    payOrder: async (
        orderNumber: string,
        data: { customer_msisdn: string; plan_id?: string }
    ): Promise<any> => {
        const response = await apiClient.post(`/orders/${orderNumber}/pay`, data);
        return response.data;
    },

    /** Request a refund for an order */
    requestRefund: async (
        orderNumber: string,
        data: { reason: string; notes?: string; items?: any[] }
    ): Promise<any> => {
        const response = await apiClient.post(`/orders/${orderNumber}/refund`, data);
        return response.data;
    },
};

import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: orderApi.createOrder,
    });
};

export const useGetUserOrders = (
    userId: string,
    params?: { status?: string; skip?: number; limit?: number },
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ["userOrders", userId, params],
        queryFn: () => orderApi.getUserOrders(userId, params),
        enabled: enabled && !!userId,
    });
};

export const usePayOrder = () => {
    return useMutation({
        mutationFn: ({
            orderNumber,
            data,
        }: {
            orderNumber: string;
            data: { customer_msisdn: string; plan_id?: string };
        }) => orderApi.payOrder(orderNumber, data),
    });
};

export const useGetVendorOrders = (
    params: GetVendorOrdersParams,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ["vendorOrders", params],
        queryFn: () => orderApi.getVendorOrders(params),
        enabled: enabled && !!params.vendor_id,
    });
};

export const useGetOrders = (
    params?: GetOrdersParams,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ["orders", params],
        queryFn: () => orderApi.getOrders(params),
        enabled,
    });
};

export const useRequestRefund = () => {
    return useMutation({
        mutationFn: ({
            orderNumber,
            data,
        }: {
            orderNumber: string;
            data: { reason: string; notes?: string; items?: any[] };
        }) => orderApi.requestRefund(orderNumber, data),
    });
};
