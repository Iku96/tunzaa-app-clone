import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "rewards" | "system" | "promo";
  read: boolean;
  timestamp: string;
  image?: string;
  actionUrl?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Klarna rewards club:",
    message:
      "Earn points without making a purchase. Complete your first mission today!",
    type: "rewards",
    read: false,
    timestamp: "2023-12-16T10:00:00Z",
    image:
      "https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "2",
    title: "The Klarna rewards cl...",
    message:
      "Keep paying with Klarna to boost your points and unlock rewards. It's as simple as that.",
    type: "rewards",
    read: false,
    timestamp: "2023-12-12T15:30:00Z",
    image:
      "https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "3",
    title: "Welcome to the club.",
    message:
      "Now you're a member of Klarna rewards club, start picking up points with every purchase.",
    type: "rewards",
    read: false,
    timestamp: "2023-12-08T09:15:00Z",
    image:
      "https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?auto=format&fit=crop&q=80&w=100&h=100",
  },
];

interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: mockNotifications,
  isLoading: false,
  error: null,

  markAsRead: (id) => {
    const { notifications } = get();
    set({
      notifications: notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    set({
      notifications: notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    });
  },

  getUnreadCount: () => {
    return get().notifications.filter((notification) => !notification.read)
      .length;
  },

  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    set({
      notifications: [newNotification, ...notifications],
    });
  },
}));
