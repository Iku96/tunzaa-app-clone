import { apiClient } from "../client";
// Import all exports from orders module to verify existence
import * as ordersModule from "../orders";

jest.mock("../client", () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe("ordersApi and hooks", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should export ordersApi and functions", () => {
        expect(ordersModule.ordersApi).toBeDefined();
        expect(ordersModule.ordersApi.getOrder).toBeInstanceOf(Function);
        expect(ordersModule.ordersApi.getOrderByNumber).toBeInstanceOf(Function);
        expect(ordersModule.ordersApi.getOrderTransactions).toBeInstanceOf(Function);
    });

    it("should export query hooks", () => {
        expect(ordersModule.useGetOrder).toBeInstanceOf(Function);
        expect(ordersModule.useGetOrderByNumber).toBeInstanceOf(Function);
        expect(ordersModule.useGetOrderTransactions).toBeInstanceOf(Function);
    });

    it("ordersApi.getOrder should call the correct API endpoint", async () => {
        const mockOrder = { order_id: "order-123", status: "pending" };
        (apiClient.get as jest.Mock).mockResolvedValue({ data: mockOrder });

        const result = await ordersModule.ordersApi.getOrder("order-123");

        expect(apiClient.get).toHaveBeenCalledWith("/orders/order-123");
        expect(result).toEqual(mockOrder);
    });

    it("ordersApi.getOrderByNumber should call the correct API endpoint", async () => {
        const mockOrder = { order_id: "order-123", order_number: "ORD-999" };
        (apiClient.get as jest.Mock).mockResolvedValue({ data: mockOrder });

        const result = await ordersModule.ordersApi.getOrderByNumber("ORD-999");

        expect(apiClient.get).toHaveBeenCalledWith("/orders/by-number/ORD-999");
        expect(result).toEqual(mockOrder);
    });

    it("ordersApi.getOrderTransactions should call the correct API endpoint", async () => {
        const mockTransactions = { data: [], total: 0 };
        (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTransactions });

        const result = await ordersModule.ordersApi.getOrderTransactions("ORD-999");

        expect(apiClient.get).toHaveBeenCalledWith("/orders/ORD-999/transactions");
        expect(result).toEqual(mockTransactions);
    });
});
