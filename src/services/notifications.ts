import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  Notification,
  GetNotificationsResponse,
  GetNotificationsParams,
} from "./types/notifications";

export const notificationsApi = {
  // Get User's Notifications
  getNotifications: async (
    params?: GetNotificationsParams
  ): Promise<GetNotificationsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.user_id) {
      searchParams.append("user_id", params.user_id);
    }
    if (params?.type) {
      searchParams.append("type", params.type);
    }
    if (params?.status) {
      searchParams.append("status", params.status);
    }
    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    const url = params?.user_id
      ? `/notifications/user/${params.user_id}?${searchParams.toString()}`
      : `/notifications/?${searchParams.toString()}`;

    const response = await apiClient.get<GetNotificationsResponse>(url);
    return response.data;
  },

  // Get Single Notification
  getNotification: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  // Mark Notification as Read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // Mark All Notifications as Read for User
  markAllAsRead: async (
    userId: string
  ): Promise<{ message: string; updated_count: number }> => {
    const response = await apiClient.patch<{
      message: string;
      updated_count: number;
    }>(`/notifications/user/${userId}/read-all`);
    return response.data;
  },
};

// React Query Hooks

export const useGetNotifications = (
  params?: GetNotificationsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsApi.getNotifications(params),
    enabled,
  });
};

export const useGetNotification = (
  notificationId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["notification", notificationId],
    queryFn: () => notificationsApi.getNotification(notificationId),
    enabled: enabled && !!notificationId,
  });
};

export const useMarkAsRead = () => {
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
  });
};

export const useMarkAllAsRead = () => {
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
  });
};
