import { deliveryApi } from "../delivery";
import { apiClient } from "../client";

jest.mock("../client", () => ({
    apiClient: {
        get: jest.fn(),
    },
}));

describe("deliveryApi.calculateShippingFee", () => {
    it("should calculate shipping fee correctly based on locations and partner", async () => {
        const mockResponse = {
            data: {
                fee: 7500,
                currency: "TZS",
                distance_km: 12.5,
                estimated_time_minutes: 45
            }
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const params = {
            origin: { lat: -6.7924, lng: 39.2083 },
            destination: { lat: -6.7624, lng: 39.2283 },
            partner_id: "test-partner-123",
            vehicle_type_id: "motorcycle"
        };

        const result = await deliveryApi.calculateShippingFee(params);

        expect(apiClient.get).toHaveBeenCalledWith("/deliveries/calculate-fee", { params });
        expect(result).toEqual(mockResponse.data);
    });
});
