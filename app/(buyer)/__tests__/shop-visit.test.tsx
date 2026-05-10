import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { View } from 'react-native';

// 1. Setup global and specific Mocks 
const mockMutate = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({ id: 'shop-uuid-789' })
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/components/ui/text', () => {
    const { Text } = require('react-native');
    return { Text };
});

// Setup auth state controller
let mockUser = { 
    user_id: 'buyer-123',
    profiles: [] as any[]
};
jest.mock('../../../src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: mockUser
    }),
}));

// Setup recommendations mock
jest.mock('../../../src/hooks/useRecommendations', () => ({
    useTrackInteraction: () => ({
        mutate: mockMutate
    })
}));

// Setup shop service state controller
const mockShopData = {
    store_id: 'shop-uuid-789',
    vendor_id: 'vendor-user-abc',
    store_name: 'Test Target Shop',
    branding: { logo_url: null },
    metadata: {}
};

jest.mock('../../../src/hooks/useShop', () => ({
    useShop: () => ({
        shop: mockShopData,
        products: [],
        loading: false,
        error: null
    })
}));

// Dummy mock dependencies so rendering doesn't crash
jest.mock('../../../src/components/product/ProductCardVertical', () => 'ProductCardVertical');
jest.mock('../../../src/components/shop/CertificateModal', () => 'CertificateModal');
jest.mock('../../../src/components/shop/BusinessMenuSheet', () => 'BusinessMenuSheet');
jest.mock('../../../src/components/shop/ShareSheet', () => 'ShareSheet');
jest.mock('../../../src/components/shop/ContactSheet', () => 'ContactSheet');
jest.mock('../../../src/stores/wishlist', () => ({ useWishlistStore: () => ({}) }));
jest.mock('../../../src/services/wishlist', () => ({ useAddToWishlist: () => ({}), useRemoveFromWishlist: () => ({}) }));
jest.mock('../../../src/stores/searchHistory', () => ({ useSearchHistory: () => ({ addItem: jest.fn() }) }));

// Import final component target
import ShopProfileScreen from '../shop/[id]';

describe('Shop Visit Telemetry Dispatcher (TDD Red Phase)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD call trackInteraction when viewing someone else store', async () => {
        // Given: viewer is Buyer-123, Owner is Vendor-abc (Different)
        mockUser = { 
            user_id: 'buyer-123',
            profiles: [] 
        };

        render(<ShopProfileScreen />);

        await waitFor(() => {
            // We expect it to dispatch interaction!
            // Since we haven't implemented the code, THIS WILL FAIL on execution!
            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    interaction_type: 'view',
                    scenario: 'user-profile',
                    item_id: 'shop-uuid-789'
                })
            );
        });
    });

    it('SHOULD NOT call trackInteraction when viewing own store', async () => {
        // Given: viewer is vendor-user-abc, Owner is vendor-user-abc (Identical)
        mockUser = { 
            user_id: 'vendor-user-abc',
            profiles: [{ role: 'vendor', profile_id: 'vendor-user-abc' }]
        };

        render(<ShopProfileScreen />);

        await waitFor(() => {
            // Wait long enough to ensure it absolutely does not call
            expect(mockMutate).not.toHaveBeenCalled();
        });
    });
});
