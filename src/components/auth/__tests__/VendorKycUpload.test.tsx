import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import EditBusinessScreen from "../../../../app/(vendor)/edit-business";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { useEntities } from "@/src/services/configuration";
import * as DocumentPicker from "expo-document-picker";

// Mock @rn-primitives/slot to prevent ES module syntax errors in node_modules
jest.mock("@rn-primitives/slot", () => {
  const React = require("react");
  return {
    Root: React.forwardRef(({ children }: any, ref: any) => children),
    Slottable: ({ children }: any) => children,
  };
});

// Mock contexts and hooks
jest.mock("@/src/contexts/TunzaaAuthContext", () => ({
  useTunzaaAuth: jest.fn(),
}));

jest.mock("@/src/contexts/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", t: {} }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("@/src/services/configuration", () => ({
  useEntities: jest.fn(),
}));

jest.mock("@/src/services/upload", () => ({
  uploadApi: {
    uploadFile: jest.fn().mockResolvedValue({
      fileCDNUrl: "https://cdn.example.com/kyc-document.pdf",
    }),
  },
}));

describe("Vendor KYC Configuration-Driven Upload", () => {
  const mockSubmitVendorKyc = jest.fn();
  const mockRefreshProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTunzaaAuth as jest.Mock).mockReturnValue({
      user: {
        user_id: "test-vendor-123",
        activeProfileRole: "vendor",
        profiles: [
          {
            role: "vendor",
            profile_id: "profile-123",
            metadata: {
              vendor_id: "vendor-123",
              business_name: "Testing Vendor",
              verification_documents: [],
            },
          },
        ],
        vendorDetails: {
          vendor_id: "vendor-123",
        },
      },
      submitVendorKyc: mockSubmitVendorKyc,
      refreshProfile: mockRefreshProfile,
    });

    (useEntities as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            name: "vendor",
            document_types: [
              {
                document_type_id: "real-license-uuid",
                name: "Business License",
                is_required: true,
              },
            ],
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///mock-license.pdf",
          name: "mock-license.pdf",
          mimeType: "application/pdf",
        },
      ],
    });
  });

  it("should upload KYC document using configuration UUID instead of hardcoded license key", async () => {
    const { getByText } = render(<EditBusinessScreen />);

    // Click on "Upload file" to trigger document selection
    const uploadArea = getByText("Upload file");
    fireEvent.press(uploadArea);

    // Wait for the modal/options to appear and verify "Business License" is displayed
    const docTypeOption = await waitFor(() => getByText("Business License"));
    expect(docTypeOption).toBeTruthy();

    // Select the "Business License" option
    fireEvent.press(docTypeOption);

    // Assert that submitVendorKyc is called with the configuration UUID 'real-license-uuid'
    await waitFor(() => {
      expect(mockSubmitVendorKyc).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            document_type_id: "real-license-uuid",
            document_url: "https://cdn.example.com/kyc-document.pdf",
          }),
        ])
      );
    });
  });
});
