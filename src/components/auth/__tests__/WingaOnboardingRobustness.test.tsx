import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { formatPhoneNumber } from "@/src/utils/phone";
import HomeScreen from "../../../../app/(winga)/index";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { useCreateAffiliate, useUpdateAffiliate } from "@/src/services/affiliates";

// Mock react to force step 6 initially for HomeScreen
jest.mock("react", () => {
  const OriginalReact = jest.requireActual("react");
  return {
    ...OriginalReact,
    useState: (initialVal: any) => {
      // If it is the step state which is initialized with 3, return 6 instead
      if (initialVal === 3) {
        return OriginalReact.useState(6);
      }
      return OriginalReact.useState(initialVal);
    },
  };
});

// Mock contexts and hooks
jest.mock("@/src/contexts/TunzaaAuthContext", () => ({
  useTunzaaAuth: jest.fn(),
}));

const mockT = {
  openDashboard: "Open My Dashboard",
  wingaOnboardingTitle: "Create Winga Profile",
  wingaOnboardingSubtitle: "Enter details",
  businessNamePlaceholder: "Business Name",
  moreDetailsTitle: "Bio",
  moreDetailsPlaceholder: "Enter bio",
  wordLimit: "240",
  requiredField: "Required",
  backBtn: "Back",
  continueBtn: "Continue",
  docTitle: "Documents",
  docSubtitle: "Upload document",
  uploadHeader: "Upload NIDA",
  successTitle: "Success!",
  successSubtitle: "Congratulations",
};

jest.mock("@/src/contexts/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", t: mockT }),
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

jest.mock("@/components/ui/text", () => {
  const { Text } = require("react-native");
  return { Text };
});

jest.mock("@/components/home/AffiliateHome", () => {
  const { View } = require("react-native");
  return { AffiliateHome: () => <View testID="affiliate-home" /> };
});

jest.mock("@/hooks/useProfileDetails", () => ({
  useProfileDetails: () => ({
    affiliateDetails: null,
    isLoading: false,
    hasErrors: false,
    errors: {},
    vendorDetails: null,
    deliveryDetails: null,
  }),
}));

jest.mock("@/src/services/upload", () => ({
  useUploadFile: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ fileCDNUrl: "https://cdn.example.com/logo.jpg" }),
  }),
}));

jest.mock("@/src/services/affiliates", () => ({
  useCreateAffiliate: jest.fn(),
  useUpdateAffiliate: jest.fn(),
}));

describe("Winga Phone Formatting Utilities", () => {
  it("should parse Tanzanian phone numbers robustly to E.164 standard", () => {
    expect(formatPhoneNumber("+255 755 123 456")).toBe("+255755123456");
    expect(formatPhoneNumber("255755123456")).toBe("+255755123456");
    expect(formatPhoneNumber("0755-123-456")).toBe("+255755123456");
    expect(formatPhoneNumber("0755123456")).toBe("+255755123456");
    expect(formatPhoneNumber("755123456")).toBe("+255755123456");
    expect(formatPhoneNumber("+255(755)123456")).toBe("+255755123456");
  });
});

describe("Winga Onboarding Profile Creation Flow", () => {
  const mockCreateAffiliateMutate = jest.fn().mockResolvedValue({ id: "new-affiliate-123" });
  const mockRefreshProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTunzaaAuth as jest.Mock).mockReturnValue({
      user: {
        user_id: "test-user-123",
        first_name: "John",
        last_name: "Doe",
        email: "john@doe.com",
        phone_number: "+255755123456",
        profiles: [],
      },
      refreshProfile: mockRefreshProfile,
      isLoading: false,
      isAuthenticated: true,
    });

    (useCreateAffiliate as jest.Mock).mockReturnValue({
      mutateAsync: mockCreateAffiliateMutate,
    });

    (useUpdateAffiliate as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });
  });

  it("should invoke useCreateAffiliate and refreshProfile on completing onboarding", async () => {
    const { getByText, queryByTestId } = render(<HomeScreen />);

    // Wait for the loading spinner to be removed once AsyncStorage resolves
    await waitFor(() => {
      expect(queryByTestId("loading-spinner")).toBeNull();
    });

    // Find the "Open My Dashboard" button
    const openDashboardButton = getByText("Open My Dashboard");
    expect(openDashboardButton).toBeTruthy();

    // Trigger the complete onboarding handler
    fireEvent.press(openDashboardButton);

    await waitFor(() => {
      expect(mockCreateAffiliateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "test-user-123",
          name: "John Doe",
          email: "john@doe.com",
          phone: "+255755123456",
        })
      );
      expect(mockRefreshProfile).toHaveBeenCalled();
    });
  });
});
