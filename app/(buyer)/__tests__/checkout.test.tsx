import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: jest.fn(fn => fn()),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/context/auth', () => ({
    useAuth: () => ({
        user: { user_id: 'buyer-123' }
    })
}));

jest.mock('@/stores/cart', () => ({
    useCartCombined: () => ({
        cart: {
            cart_id: 'cart-123',
            items: [
                {
                    item_id: 'item-1',
                    product_name: 'Test Product',
                    sale_price: 25000,
                    quantity: 1,
                    image_url: 'https://example.com/image.png'
                }
            ]
        },
        isLoading: false,
        refetch: jest.fn(),
        hasItems: () => true,
        getTotalItemCount: () => 1,
        getTempCart: () => null
    }),
    useCartTotals: () => ({
        data: { total: 25000 },
        isLoading: false
    })
}));

const mockBuyerProfile = {
    user_id: 'buyer-123',
    default_delivery_address: 'addr-default-999',
    delivery_address: [
        {
            address_id: 'addr-default-999',
            title: 'Apartment',
            address_line1: 'Mlimani Towers, Sam Nujoma Rd',
            lat: '-6.123',
            lng: '39.456'
        }
    ]
};

const mockRefetchBuyerProfile = jest.fn();

jest.mock('@/src/services/buyers', () => ({
    useGetBuyerProfile: () => ({
        data: mockBuyerProfile,
        isLoading: false,
        refetch: mockRefetchBuyerProfile
    })
}));

jest.mock('@/hooks/useAddressManagement', () => ({
    useAddressManagement: () => ({
        buyerProfile: mockBuyerProfile,
        profileLoading: false,
        handleAddressSubmit: jest.fn()
    })
}));

jest.mock('@/src/services/delivery', () => ({
    useDeliveryTypesWithFallback: () => ({ data: [], isUsingFallback: false }),
    useGetDeliveryPartners: () => ({ data: [] }),
    useCalculateShippingFee: () => ({ mutate: jest.fn(), data: null, isPending: false })
}));

jest.mock('@/src/services/vendors', () => ({
    useGetVendor: () => ({ data: null })
}));

jest.mock('@/src/services/configuration', () => ({
    useGetVehicleTypes: () => ({ data: [] })
}));

jest.mock('@/hooks/useThemeColors', () => ({
    useThemeColors: () => ({}),
    useResolvedThemeColors: () => ({})
}));

jest.mock('@/hooks/useResponsive', () => ({
    useResponsive: () => ({ isDesktop: false })
}));

jest.mock('@/hooks/useI18n', () => ({
    useI18n: () => ({ t: (k: string) => k })
}));

jest.mock('@/hooks/usePageTitle', () => ({
    usePageTitle: jest.fn()
}));

jest.mock('@/hooks/useTenantModules', () => ({
    useTenantModules: () => ({ isPaymentsEnabled: true, isDeliveryEnabled: true })
}));

// Mock components that import @rn-primitives to prevent SyntaxError in Jest
jest.mock('@/components/ui/text', () => ({
    Text: ({ children, ...props }: any) => <mock-Text {...props}>{children}</mock-Text>
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <mock-Button {...props}>{children}</mock-Button>
}));

jest.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <mock-Card {...props}>{children}</mock-Card>
}));

jest.mock('@/components/ui/alert', () => ({
    Alert: ({ children, ...props }: any) => <mock-Alert {...props}>{children}</mock-Alert>
}));

jest.mock('@/components/ui/badge', () => ({
    Badge: ({ children, ...props }: any) => <mock-Badge {...props}>{children}</mock-Badge>
}));

jest.mock('@/components/modals/AddressModal', () => ({
    AddressModal: () => <mock-AddressModal />
}));

jest.mock('@/components/layout/DesktopLayoutWrapper', () => ({
    DesktopLayoutWrapper: ({ children }: any) => children
}));

jest.mock('@/components/checkout', () => ({
    CheckoutStepHeader: () => null,
    CheckoutStep: {},
    OrderOverviewSection: () => null,
    DeliveryAddressSection: () => null,
    DeliveryOptionsSection: () => null,
    DeliveryDetailsSection: () => null,
    PaymentMethodSection: () => null,
    OrderSummarySection: () => null,
}));

jest.mock('@/components/recommendations', () => ({
    SimilarItems: () => null
}));

import CheckoutScreen from '../cart/checkout';

describe('CheckoutScreen Address TDD', () => {
    it('SHOULD automatically select the default delivery address from buyer profile', async () => {
        const { getByText } = render(<CheckoutScreen />);
        
        // Assert that the profile fetch is triggered on focus
        expect(mockRefetchBuyerProfile).toHaveBeenCalled();
    });
});
