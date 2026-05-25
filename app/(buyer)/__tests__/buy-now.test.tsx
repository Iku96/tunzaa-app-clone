import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({
        id: 'product-123'
    }),
    useFocusEffect: (cb: any) => cb()
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: {
            id: 'product-123',
            name: 'Test Product',
            price: 50000,
            verificationStatus: 'approved',
            images: ['https://example.com/image.png'],
        },
        isLoading: false,
    })
}));

jest.mock('../../../src/services/products', () => ({
    productsApi: {
        getProductById: jest.fn().mockResolvedValue({
            product_id: 'product-123',
            name: 'Test Product',
            price: 50000,
            base_price: 50000,
            verification_status: 'approved',
            images: ['https://example.com/image.png'],
            store: { store_id: 'store-123', store_name: 'Test Store' }
        }),
    }
}));

const mockBuyNow = jest.fn();
jest.mock('../../../src/stores/cart', () => ({
    useCartCombined: () => ({
        addItem: jest.fn(),
        buyNow: mockBuyNow,
        isAdding: false,
        refetch: jest.fn()
    }),
    useAddToCart: () => ({
        mutateAsync: jest.fn()
    })
}));

jest.mock('../../../src/services/wishlist', () => ({
    useCheckWishlistStatus: () => ({ data: false }),
    useAddToWishlist: () => ({ mutateAsync: jest.fn() }),
    useRemoveFromWishlist: () => ({ mutateAsync: jest.fn() })
}));

jest.mock('../../../src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        isAuthenticated: true,
        user: { user_id: 'buyer-999', id: 'buyer-999' }
    })
}));

jest.mock('../../../src/services/ratings', () => ({
    useGetRatingSummary: () => ({ data: null })
}));

jest.mock('../../../src/services/buyers', () => ({
    useGetBuyerProfile: () => ({ data: null, refetch: jest.fn() })
}));

jest.mock('../../../src/services/recommendations', () => ({
    recommendationsApi: {
        getRecommendations: () => Promise.resolve({ items: [] })
    }
}));

jest.mock('../../../src/components/product/ProductCardVertical', () => 'ProductCardVertical');
jest.mock('../../../src/components/shop/ShareSheet', () => 'ShareSheet');
jest.mock('../../../src/stores/searchHistory', () => ({
    useSearchHistory: () => ({
        addItem: jest.fn()
    })
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import ProductDetailScreen from '../product/[id]';

describe('Buy Now Navigation Flow (RED Phase)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD redirect the Buy Now flow to Order Summary page (/(buyer)/cart/checkout) instead of cart page', async () => {
        const { getByText } = render(<ProductDetailScreen />);
        
        // Wait for product details to load
        await waitFor(() => {
            expect(getByText('Buy Now')).toBeTruthy();
        });

        // Find Buy Now button and click it
        const buyNowBtn = getByText('Buy Now');
        fireEvent.press(buyNowBtn);

        await waitFor(() => {
            expect(mockBuyNow).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/(buyer)/cart/checkout',
                params: {
                    productId: 'product-123',
                    returnTo: 'product'
                }
            });
        });
    });
});
