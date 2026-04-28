export interface NotificationMetadata {
  data: Array<
    | {
        body: string;
        headers: Record<string, string>;
        statusCode: number;
      }
    | string
  >;
  status: number;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string | null;
  type: "email" | "push" | "sms" | "in_app";
  recipient: string;
  subject: string;
  body: string;
  token: string | null;
  title: string | null;
  status: "sent" | "pending" | "failed" | "delivered" | "read";
  metadata: NotificationMetadata | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  _id: string;
  createdAt: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
}

export interface GetNotificationsParams {
  user_id?: string;
  type?: string;
  status?: string;
  skip?: number;
  limit?: number;
}
