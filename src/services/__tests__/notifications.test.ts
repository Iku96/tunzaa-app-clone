import { apiClient } from "../client";
import * as notificationsModule from "../notifications";

jest.mock("../client", () => ({
    apiClient: {
        get: jest.fn(),
        patch: jest.fn(),
    },
}));

describe("notificationsApi and hooks", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should export notificationsApi and functions", () => {
        expect(notificationsModule.notificationsApi).toBeDefined();
        expect(notificationsModule.notificationsApi.getNotifications).toBeInstanceOf(Function);
        expect(notificationsModule.notificationsApi.getNotification).toBeInstanceOf(Function);
        expect(notificationsModule.notificationsApi.markAsRead).toBeInstanceOf(Function);
        expect(notificationsModule.notificationsApi.markAllAsRead).toBeInstanceOf(Function);
    });

    it("should export query and mutation hooks", () => {
        expect(notificationsModule.useGetNotifications).toBeInstanceOf(Function);
        expect(notificationsModule.useGetNotification).toBeInstanceOf(Function);
        expect(notificationsModule.useMarkAsRead).toBeInstanceOf(Function);
        expect(notificationsModule.useMarkAllAsRead).toBeInstanceOf(Function);
    });

    it("notificationsApi.getNotifications should call the correct API endpoint with user_id", async () => {
        const mockResponse = { notifications: [] };
        (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

        const result = await notificationsModule.notificationsApi.getNotifications({ user_id: "user-123" });

        expect(apiClient.get).toHaveBeenCalledWith("notifications/user/user-123?user_id=user-123");
        expect(result).toEqual(mockResponse);
    });

    it("notificationsApi.getNotification should call the correct API endpoint", async () => {
        const mockNotification = { id: "notif-123", subject: "Test" };
        (apiClient.get as jest.Mock).mockResolvedValue({ data: mockNotification });

        const result = await notificationsModule.notificationsApi.getNotification("notif-123");

        expect(apiClient.get).toHaveBeenCalledWith("notifications/notif-123");
        expect(result).toEqual(mockNotification);
    });

    it("notificationsApi.markAsRead should call the correct API endpoint", async () => {
        const mockNotification = { id: "notif-123", status: "read" };
        (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockNotification });

        const result = await notificationsModule.notificationsApi.markAsRead("notif-123");

        expect(apiClient.patch).toHaveBeenCalledWith("notifications/notif-123/read");
        expect(result).toEqual(mockNotification);
    });

    it("notificationsApi.markAllAsRead should call the correct API endpoint", async () => {
        const mockResponse = { message: "success", updated_count: 5 };
        (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

        const result = await notificationsModule.notificationsApi.markAllAsRead("user-123");

        expect(apiClient.patch).toHaveBeenCalledWith("notifications/user/user-123/read-all");
        expect(result).toEqual(mockResponse);
    });
});
