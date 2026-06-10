import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
    }),
    useFocusEffect: (cb: any) => cb()
}));

jest.mock('@/src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: { 
            profiles: [{ role: 'vendor', metadata: { vendor_id: 'test-vendor-123' } }] 
        },
        setIsSidebarOpen: jest.fn()
    })
}));

jest.mock('@/src/services/reports', () => ({
    useGetOrderStatusDistribution: () => ({
        data: {
            data: [
                { status: 'delivered', order_count: 5 },
                { status: 'pending', order_count: 2 },
                { status: 'processing', order_count: 1 }
            ]
        },
        isLoading: false
    })
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: {
            items: [
                {
                    order_id: 'live-order-456',
                    order_number: 'ORD-LIVE-01',
                    status: 'delivered',
                    totals: { total: 25000 },
                    items: [
                        { name: 'Live Product' }
                    ]
                }
            ]
        },
        isLoading: false
    })
}));

jest.mock('react-native-svg', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        Svg: (props: any) => <View {...props} testID="mock-svg" />,
        G: (props: any) => <View {...props} testID="mock-g" />,
        Circle: (props: any) => <View {...props} testID="mock-circle" />
    };
});

jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
    ChevronDown: 'ChevronDown',
    Filter: 'Filter',
    Search: 'Search',
    LayoutGrid: 'LayoutGrid'
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: jest.fn().mockImplementation(({ children }) => <>{children}</>),
        SafeAreaConsumer: jest.fn().mockImplementation(({ children }) => children(inset)),
        useSafeAreaInsets: jest.fn().mockReturnValue(inset),
        SafeAreaView: jest.fn().mockImplementation(({ children }) => <>{children}</>),
    };
});

import LiveOrdersScreen from '../live-orders';

describe('Vendor Live Orders Screen Routing Flow (RED Phase)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD redirect to the order details screen (/(vendor)/orders/[id]) when an order row is pressed', async () => {
        const { getByText } = render(<LiveOrdersScreen />);
        
        await waitFor(() => {
            // Find the order number we mocked
            expect(getByText('#VE-01')).toBeTruthy();
        });

        const orderRowText = getByText('#VE-01');
        // The component currently might not have a touchable row. We'll fire event on the row wrapper or text.
        // If it throws, it means the row isn't touchable, which we'll fix in GREEN phase.
        fireEvent.press(orderRowText);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/(vendor)/orders/live-order-456');
        });
    });
});
