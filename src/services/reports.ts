import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

// Types for vendor reports
export interface VendorGMVResponse {
  data: Array<{
    vendor_id: string;
    vendor_name: string;
    "orders.count": number;
    "orders.total_revenue": number;
    "orders.avg_order_value": number;
  }>;
}

export interface OrderStatusDistributionResponse {
  data: Array<{
    status: string;
    order_count: number;
    total_value: number;
    percentage: number;
  }>;
}

export interface TopPerformingProductsResponse {
  data: Array<{
    product_id: string;
    product_name: string;
    vendor_id: string;
    vendor_name: string;
    order_count: number;
    product_gmv: number;
  }>;
}

export interface DailyGMVPerformanceResponse {
  data: Array<{
    sales_date: string;
    daily_orders: number;
    daily_gmv: number;
    daily_aov: number;
    daily_subtotal: number;
    daily_tax: number;
    daily_shipping: number | null;
    prev_day_gmv: number | null;
    daily_gmv_growth_percent: number | null;
    cumulative_gmv: number;
  }>;
}

export interface WeeklyGMVPerformanceResponse {
  data: Array<{
    week_start: string;
    weekly_orders: number;
    weekly_gmv: number;
    weekly_aov: number;
    prev_week_gmv: number | null;
    weekly_gmv_growth_percent: number | null;
  }>;
}

export interface MonthlyGMVPerformanceResponse {
  data: Array<{
    month_start: string;
    monthly_orders: number;
    monthly_gmv: number;
    monthly_aov: number;
    prev_month_gmv: number | null;
    monthly_gmv_growth_percent: number | null;
  }>;
}

// Types for delivery partner reports
export interface DeliveryPartnerGMVResponse {
  data: Array<{
    delivery_partner_id: string;
    partner_name: string;
    delivery_stage: string;
    "orders.count": number;
    "orders.total_revenue": number;
    "orders.avg_order_value": number;
    "orders.total_shipping_revenue": number;
    "orders.avg_shipping_fee": number;
    "orders.delivered_count": number;
    "orders.cancelled_count": number;
    "orders.success_rate": number;
  }>;
}

export interface DeliveryPartnerPerformanceResponse {
  data: Array<{
    delivery_partner_id: string;
    partner_name: string;
    "performance.total_orders": number;
    "performance.successful_deliveries": number;
    "performance.cancelled_deliveries": number;
    "performance.pending_deliveries": number;
    "performance.success_rate": number;
    "performance.avg_shipping_cost": number;
    "performance.total_shipping_revenue": number;
    "performance.avg_order_value": number;
    "performance.active_days": number;
    "performance.avg_fulfillment_time_hours": number;
    "performance.first_order_date": string;
    "performance.last_order_date": string;
  }>;
}

export const reportsApi = {
  // Get Vendor GMV
  getVendorGMV: async (
    vendorId: string,
    params?: { start_date?: string; end_date?: string }
  ): Promise<VendorGMVResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append("vendor_id", vendorId);
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);

    const response = await apiClient.get<VendorGMVResponse>(
      `/reports/gmv/vendor?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Order Status Distribution
  getOrderStatusDistribution: async (
    vendorId: string,
    params?: { start_date?: string; end_date?: string }
  ): Promise<OrderStatusDistributionResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append("vendor_id", vendorId);
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);

    const response = await apiClient.get<OrderStatusDistributionResponse>(
      `/reports/order-status-distribution?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Top Performing Products
  getTopPerformingProducts: async (
    vendorId: string,
    params?: { start_date?: string; end_date?: string }
  ): Promise<TopPerformingProductsResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append("vendor_id", vendorId);
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);

    const response = await apiClient.get<TopPerformingProductsResponse>(
      `/reports/top-performing-products?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Daily GMV Performance
  getDailyGMVPerformance: async (
    vendorId: string,
    params?: { start_date?: string; end_date?: string }
  ): Promise<DailyGMVPerformanceResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append("vendor_id", vendorId);
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);

    const response = await apiClient.get<DailyGMVPerformanceResponse>(
      `/reports/daily-gmv-performance?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Weekly GMV Performance
  getWeeklyGMVPerformance: async (
    vendorId: string
  ): Promise<WeeklyGMVPerformanceResponse> => {
    const response = await apiClient.get<WeeklyGMVPerformanceResponse>(
      `/reports/weekly-gmv-performance?vendor_id=${vendorId}`
    );
    return response.data;
  },

  // Get Monthly GMV Performance
  getMonthlyGMVPerformance: async (
    vendorId: string
  ): Promise<MonthlyGMVPerformanceResponse> => {
    const response = await apiClient.get<MonthlyGMVPerformanceResponse>(
      `/reports/monthly-gmv-performance?vendor_id=${vendorId}`
    );
    return response.data;
  },

  // Get Delivery Partner GMV
  getDeliveryPartnerGMV: async (
    deliveryPartnerId: string
  ): Promise<DeliveryPartnerGMVResponse> => {
    const response = await apiClient.get<DeliveryPartnerGMVResponse>(
      `/reports/gmv/delivery-partner?delivery_partner_id=${deliveryPartnerId}`
    );
    return response.data;
  },

  // Get Delivery Partner Performance
  getDeliveryPartnerPerformance: async (
    deliveryPartnerId: string
  ): Promise<DeliveryPartnerPerformanceResponse> => {
    const response = await apiClient.get<DeliveryPartnerPerformanceResponse>(
      `/reports/delivery-partner-performance?delivery_partner_id=${deliveryPartnerId}`
    );
    return response.data;
  },
};

// React Query Hooks
export const useGetVendorGMV = (
  vendorId: string,
  params?: { start_date?: string; end_date?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["vendorGMV", vendorId, params],
    queryFn: () => reportsApi.getVendorGMV(vendorId, params),
    enabled: enabled && !!vendorId,
  });
};

export const useGetOrderStatusDistribution = (
  vendorId: string,
  params?: { start_date?: string; end_date?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["orderStatusDistribution", vendorId, params],
    queryFn: () => reportsApi.getOrderStatusDistribution(vendorId, params),
    enabled: enabled && !!vendorId,
  });
};

export const useGetTopPerformingProducts = (
  vendorId: string,
  params?: { start_date?: string; end_date?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["topPerformingProducts", vendorId, params],
    queryFn: () => reportsApi.getTopPerformingProducts(vendorId, params),
    enabled: enabled && !!vendorId,
  });
};

export const useGetDailyGMVPerformance = (
  vendorId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["dailyGMVPerformance", vendorId],
    queryFn: () => reportsApi.getDailyGMVPerformance(vendorId),
    enabled: enabled && !!vendorId,
  });
};

export const useGetWeeklyGMVPerformance = (
  vendorId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["weeklyGMVPerformance", vendorId],
    queryFn: () => reportsApi.getWeeklyGMVPerformance(vendorId),
    enabled: enabled && !!vendorId,
  });
};

export const useGetMonthlyGMVPerformance = (
  vendorId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["monthlyGMVPerformance", vendorId],
    queryFn: () => reportsApi.getMonthlyGMVPerformance(vendorId),
    enabled: enabled && !!vendorId,
  });
};

// Delivery Partner React Query Hooks
export const useGetDeliveryPartnerGMV = (
  deliveryPartnerId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["deliveryPartnerGMV", deliveryPartnerId],
    queryFn: () => reportsApi.getDeliveryPartnerGMV(deliveryPartnerId),
    enabled: enabled && !!deliveryPartnerId,
  });
};

export const useGetDeliveryPartnerPerformance = (
  deliveryPartnerId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["deliveryPartnerPerformance", deliveryPartnerId],
    queryFn: () => reportsApi.getDeliveryPartnerPerformance(deliveryPartnerId),
    enabled: enabled && !!deliveryPartnerId,
  });
};
