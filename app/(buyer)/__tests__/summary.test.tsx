import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// 1. Mocks
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({
        calculatedFee: '4500',
        deliveryType: 'standard'
    })
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock the Auth Contexts
jest.mock('@/context/auth', () => ({
    useAuth: () => ({
        user: { user_id: 'correct-buyer-999' }
    })
}));

jest.mock('../../../src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: { user_id: 'legacy-buyer-000' }
    })
}));

// Mock the cart store
const mockUseCartCombined = jest.fn((userId: string) => ({
    cart: {
        cart_id: 'cart-123',
        items: [
            {
                item_id: 'item-1',
                product_name: 'Premium Test Product',
                unit_price: 25000,
                quantity: 1,
                image_url: 'https://example.com/image.png'
            }
        ]
    },
    isLoading: false,
    refetch: jest.fn()
}));

jest.mock('@/stores/cart', () => ({
    useCartCombined: (userId: string) => mockUseCartCombined(userId),
    useCartTotals: (cartId?: string) => ({
        data: {
            subtotal: 25000,
            discount: 0,
            tax: 0,
            total: 25000
        },
        isLoading: false
    })
}));

import OrderSummaryScreen from '../cart/summary';

describe('OrderSummaryScreen TDD (RED Phase)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD fetch cart using the correct user from `@/context/auth`', () => {
        render(<OrderSummaryScreen />);
        
        // Assert that the cart store hook was invoked with the correct user ID from `@/context/auth`
        // Currently summary.tsx uses useTunzaaAuth, so it will receive 'legacy-buyer-000', causing this to FAIL.
        expect(mockUseCartCombined).toHaveBeenCalledWith('correct-buyer-999');
    });

    it('SHOULD dynamically calculate and pass the correct delivery fee on checkout', () => {
        const { getByText } = render(<OrderSummaryScreen />);
        
        // Find installment button and press it
        const installmentBtn = getByText('Installment');
        fireEvent.press(installmentBtn);
        
        // Assert that the push parameters propagated the dynamic fee of 4500 (from local params) instead of the hardcoded 10000.
        // Currently, it will propagate the hardcoded total/fee, causing this to FAIL.
        expect(mockPush).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/(buyer)/payment/installment-goal',
                params: expect.objectContaining({
                    amount: 29500, // 25000 subtotal + 4500 dynamic fee
                    deliveryFees: '4500'
                })
            })
        );
    });
});
