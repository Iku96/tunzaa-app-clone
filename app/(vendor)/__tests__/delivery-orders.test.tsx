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

jest.mock('@/hooks/useProfileDetails', () => ({
    useProfileDetails: () => ({
        vendorDetails: { vendor_id: 'test-vendor-123' }
    })
}));

jest.mock('@/src/services/order-management', () => ({
    useGetVendorOrders: () => ({
        data: {
            items: [
                {
                    order_id: 'test-order-123',
                    order_number: 'ORD-001',
                    status: 'pending',
                    totals: { total: 10000, shipping: 2000 },
                    shipping_address: {
                        first_name: 'John',
                        last_name: 'Doe',
                        address_line1: '123 Test St',
                        city: 'Test City',
                        phone: '0712345678'
                    },
                    items: [
                        { item_id: 'item-1', name: 'Test Product', quantity: 1, unit_price: 10000, total: 10000 }
                    ],
                    payment_status: 'paid',
                    created_at: '2026-06-09T10:00:00Z',
                }
            ],
            total: 1
        },
        isLoading: false,
        error: null
    })
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
    MapPin: 'MapPin',
    Phone: 'Phone',
    ChevronDown: 'ChevronDown',
    Truck: 'Truck',
    Bike: 'Bike',
    CheckCircle: 'CheckCircle'
}));

import DeliveryOrdersScreen from '../delivery-orders';

describe('Vendor Delivery Orders Screen Routing Flow (RED Phase)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD redirect to the order details screen (/(vendor)/orders/[id]) when "Manage Order" is pressed', async () => {
        const { getByText } = render(<DeliveryOrdersScreen />);
        
        await waitFor(() => {
            expect(getByText('Manage Order')).toBeTruthy();
        });

        const manageOrderBtn = getByText('Manage Order');
        fireEvent.press(manageOrderBtn);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/(vendor)/orders/test-order-123');
        });
    });
});
