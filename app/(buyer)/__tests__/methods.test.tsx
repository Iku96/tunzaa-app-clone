import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentMethodsScreen from '../payment/methods';

// 1. Mocks
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
    }),
    useLocalSearchParams: () => ({
        amount: '35000',
        cartId: 'cart-123',
        addressId: 'addr-default-999',
        paymentMethod: 'tunzaa_instalments',
        installmentFrequency: 'weekly',
        installmentTargetDate: '2025-06-30',
    }),
}));

// Mock Auth Context
jest.mock('../../../src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: { user_id: 'buyer-user-123', first_name: 'Femi', email: 'femi@example.com', phone_number: '255712345678' }
    })
}));

// Mock Burnt native module
jest.mock('burnt', () => ({
    toast: jest.fn(),
    alert: jest.fn()
}));


// Mock components that import @rn-primitives to prevent SyntaxError in Jest
jest.mock('@/components/ui/text', () => {
    const { Text } = require('react-native');
    return { Text };
});

// Mock cart combined
jest.mock('@/src/stores/cart', () => ({


    useClearCart: () => ({
        mutateAsync: jest.fn()
    }),
    useCartCombined: () => ({
        cart: {
            cart_id: 'cart-123',
            items: [
                {
                    item_id: 'item-1',
                    product_name: 'Smart Watch Series 5',
                    unit_price: 35000,
                    quantity: 1
                }
            ]
        }
    })
}));

// Mock API Hooks
const mockCreateOrder = jest.fn().mockResolvedValue({ order_number: 'ORD-999' });
jest.mock('@/src/services/orders', () => ({
    useCreateOrder: () => ({
        mutateAsync: mockCreateOrder
    })
}));

const mockInitiatePayment = jest.fn().mockResolvedValue({ success: true, transactionID: 'TX-111' });
const mockCreateInstallmentPlan = jest.fn().mockResolvedValue({ plan: { plan_id: 'PLAN-555' } });
jest.mock('@/src/services/payments', () => ({
    useInitiatePayment: () => ({
        mutateAsync: mockInitiatePayment
    }),
    useCreateInstallmentPlan: () => ({
        mutateAsync: mockCreateInstallmentPlan
    }),
    useCheckPaymentStatus: () => ({
        data: null
    })
}));

jest.mock('@/src/services/buyers', () => ({
    useGetBuyerProfile: () => ({
        data: {
            delivery_address: [
                { address_id: 'addr-default-999', address_line1: 'Mlimani Towers' }
            ]
        }
    })
}));

describe('PaymentMethodsScreen (TDD Verification)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the payment options and expands M-Pesa inline accordion on press', () => {
        const { getByText, queryByText, queryByPlaceholderText } = render(<PaymentMethodsScreen />);
        
        // 1. Initial State Checks
        expect(getByText('Card Payment')).toBeTruthy();
        expect(getByText('M-Pesa')).toBeTruthy();
        expect(getByText('Airtel Money')).toBeTruthy();
        expect(getByText('Halopesa')).toBeTruthy();
        
        // Phone input should not be visible before expansion
        expect(queryByPlaceholderText('Enter Phone number')).toBeFalsy();

        // 2. Expand M-Pesa
        fireEvent.press(getByText('M-Pesa'));

        // 3. Expanded State Checks
        expect(getByText(/You are about to pay TZS 35,000 on Tunzaa for the purchase of a Smart Watch Series 5/)).toBeTruthy();
        expect(queryByPlaceholderText('Enter Phone number')).toBeTruthy();
    });

    it('triggers order creation and installment plan generation on correct phone submission', async () => {
        const { getByText, getByPlaceholderText } = render(<PaymentMethodsScreen />);
        
        // 1. Expand M-Pesa
        fireEvent.press(getByText('M-Pesa'));

        // 2. Fill Phone number
        const phoneInput = getByPlaceholderText('Enter Phone number');
        fireEvent.changeText(phoneInput, '0712345678');

        // 3. Click Make a Payment button inside the accordion
        const makePaymentBtn = getByText('Make a Payment');
        fireEvent.press(makePaymentBtn);

        // Confirm modal should appear
        expect(getByText(/DO YOU WANT TO PAY TZS 35,000 TO TUNZAA fintech?/)).toBeTruthy();

        // Click Confirm
        const confirmBtn = getByText('Confirm');
        fireEvent.press(confirmBtn);

        // Verify order creation is called
        await waitFor(() => {
            expect(mockCreateOrder).toHaveBeenCalled();
            expect(mockCreateInstallmentPlan).toHaveBeenCalled();
            expect(mockInitiatePayment).toHaveBeenCalled();
        });
    });
});
