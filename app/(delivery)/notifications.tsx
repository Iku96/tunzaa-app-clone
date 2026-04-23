import React from "react";
import { NotificationsList } from "@/components/notifications";
import { useI18n } from "@/hooks/useI18n";

const NotificationsScreen = () => {
  const { t } = useI18n();
  return <NotificationsList title={t("delivery.delivery_notifications")} />;
};

export default NotificationsScreen;
