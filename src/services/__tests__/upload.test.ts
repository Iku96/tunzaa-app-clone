import { uploadApi } from "../upload";
import { apiClient, documentClient } from "../client";

jest.mock("../client", () => ({
    apiClient: {
        post: jest.fn(),
    },
    documentClient: {
        post: jest.fn(),
    },
}));

describe("uploadApi.uploadDocument", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("SHOULD upload to the main apiClient v1 uploads endpoint instead of the document client upload endpoint", async () => {
        const mockResponse = {
            data: {
                id: "test-doc-123",
                url: "https://cdn.tunzaa.co.tz/uploads/test.jpg",
            },
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const formData = new FormData();
        formData.append("file", { uri: "test", name: "test.jpg", type: "image/jpeg" } as any);

        const result = await uploadApi.uploadDocument(formData);

        // This should fail because the original code calls documentClient.post("/upload", ...)
        expect(apiClient.post).toHaveBeenCalledWith("/uploads", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        expect(documentClient.post).not.toHaveBeenCalled();
        expect(result).toEqual(mockResponse.data);
    });
});
