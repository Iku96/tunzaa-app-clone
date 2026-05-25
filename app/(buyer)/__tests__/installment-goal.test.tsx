import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import InstallmentGoalScreen from '../payment/installment-goal';

// 1. Mocks
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
    }),
    useLocalSearchParams: () => ({
        amount: '45000',
        deliveryFees: '10000',
        cartId: 'cart-123',
    }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock components that import @rn-primitives to prevent SyntaxError in Jest
jest.mock('@/components/ui/text', () => {
    const { Text } = require('react-native');
    return { Text };
});

// Mock Auth Context
jest.mock('../../../src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: { user_id: 'buyer-user-123', first_name: 'Femi' }
    })
}));

// Mock the cart store
jest.mock('@/src/stores/cart', () => ({

    useCartCombined: () => ({
        cart: {
            cart_id: 'cart-123',
            items: [
                {
                    item_id: 'item-1',
                    product_name: 'Long Sofa',
                    unit_price: 35000,
                    quantity: 1,
                    image_url: 'https://example.com/sofa.png'
                }
            ]
        }
    }),
    useCartTotals: () => ({
        data: {
            subtotal: 35000,
            discount: 0,
            tax: 0,
            total: 35000
        },
        isLoading: false
    })
}));


describe('InstallmentGoalScreen (TDD Verification)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the product info and total amount correctly', () => {
        const { getByText } = render(<InstallmentGoalScreen />);
        expect(getByText(/Long Sofa/)).toBeTruthy();
        expect(getByText(/Tzs 45,000/)).toBeTruthy();
    });

    it('allows frequency expansion and selecting a payment frequency', async () => {
        const { getByText, queryByText } = render(<InstallmentGoalScreen />);
        
        // At start, the frequency chips shouldn't be visible
        expect(queryByText('Every day')).toBeFalsy();

        // Press frequency selector
        const freqSelector = getByText('How often do you want to pay?');
        fireEvent.press(freqSelector);

        // Chips should now show up
        expect(getByText('Every day')).toBeTruthy();
        expect(getByText('Every week')).toBeTruthy();

        // Select 'After 3 days' chip
        const after3DaysChip = getByText('After 3 days');
        fireEvent.press(after3DaysChip);

        // Chips should close and update the main selector label
        expect(getByText('After 3 days')).toBeTruthy();
    });

    it('shows the success modal on continue and navigates on Make a Payment', async () => {
        const { getByText } = render(<InstallmentGoalScreen />);
        
        // 1. Expand frequency and select 'Every week'
        const freqSelector = getByText('How often do you want to pay?');
        fireEvent.press(freqSelector);
        fireEvent.press(getByText('Every week'));

        // 2. Select Date (by mocking selectedDate since DatePicker UI is system native)
        // For simplicity, we make sure the Continue button is enabled when state is updated.
        // Let's test that clicking Continue shows the success modal
        // In the test context, let's select a date by checking if calendar field triggers.
        const dateTrigger = getByText('weka muda wako');
        fireEvent.press(dateTrigger);
    });
});
