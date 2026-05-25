import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockMutate = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        back: mockBack,
    }),
    useLocalSearchParams: () => ({})
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons'
}));

jest.mock('../../../components/ui/google-places-autocomplete', () => ({
    GooglePlacesAutocompleteComponent: 'GooglePlacesAutocompleteComponent'
}));

jest.mock('../../../src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: { user_id: 'buyer-123', tenant_id: 'tenant-abc', email: 'buyer@test.com', phone_number: '123456' }
    })
}));

jest.mock('../../../src/services/buyers', () => ({
    useGetBuyerProfile: () => ({
        data: {
            user_id: 'buyer-123',
            tenant_id: 'tenant-abc',
            contact_email: 'buyer@test.com',
            contact_phone: '123456',
            delivery_address: []
        },
        isLoading: false
    }),
    useUpdateBuyerProfile: () => ({
        mutate: mockMutate,
        isPending: false
    })
}));

jest.mock('../../../stores/map-picker', () => ({
    useMapPickerStore: (selector: any) => {
        const state = { result: null, setResult: jest.fn(), clearResult: jest.fn() };
        return selector(state);
    }
}));

import AddDeliveryAddressScreen from '../profile/delivery/address';

describe('AddDeliveryAddressScreen - Choose Delivery Type TDD (RED Phase)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD render the Choose delivery type options', () => {
        const { getByText } = render(<AddDeliveryAddressScreen />);
        expect(getByText('Apartment')).toBeTruthy();
        expect(getByText('House')).toBeTruthy();
        expect(getByText('Office')).toBeTruthy();
        expect(getByText('Hotel')).toBeTruthy();
    });

    it('SHOULD show specific apartment input fields when Apartment is expanded', async () => {
        const { getByText, queryByPlaceholderText, getByPlaceholderText } = render(<AddDeliveryAddressScreen />);
        
        // Collapsed initially, apartment input should not be visible
        expect(queryByPlaceholderText('Enter apartment name')).toBeNull();

        // Click Apartment to expand
        fireEvent.press(getByText('Apartment'));

        // Input should now be visible
        expect(getByPlaceholderText('Enter apartment name')).toBeTruthy();
        expect(getByPlaceholderText('Enter street name')).toBeTruthy();
        expect(getByPlaceholderText('E.g., Apt 2B, 3rd Floor')).toBeTruthy();
    });

    it('SHOULD show specific house input fields when House is expanded', () => {
        const { getByText, getByPlaceholderText } = render(<AddDeliveryAddressScreen />);

        // Click House to expand
        fireEvent.press(getByText('House'));

        expect(getByPlaceholderText('Enter House No.')).toBeTruthy();
        expect(getByPlaceholderText('City')).toBeTruthy();
    });

    it('SHOULD submit correctly formatted delivery address on Save Address', async () => {
        const { getAllByText, getByText, getByPlaceholderText } = render(<AddDeliveryAddressScreen />);

        // Expand Apartment
        fireEvent.press(getByText('Apartment'));

        // Fill out fields
        fireEvent.changeText(getByPlaceholderText('Enter apartment name'), 'Mlimani Towers');
        fireEvent.changeText(getByPlaceholderText('Enter street name'), 'Sam Nujoma Rd');
        fireEvent.changeText(getByPlaceholderText('E.g., Apt 2B, 3rd Floor'), 'Apt 4B, 4th Floor');
        fireEvent.changeText(getByPlaceholderText('E.g., Please leave at the door or knock instead of ringing the bell'), 'Call when outside');

        // Click Save Address (which is within Apartment section)
        const saveBtns = getAllByText('Save Address');
        // Click the first one (since it's inside the active expanded accordion)
        fireEvent.press(saveBtns[0]);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'buyer-123',
                    data: expect.objectContaining({
                        delivery_address: expect.arrayContaining([
                            expect.objectContaining({
                                title: 'Apartment',
                                address_line1: 'Apt 4B, 4th Floor, Mlimani Towers, Sam Nujoma Rd',
                                land_mark: 'Call when outside'
                            })
                        ])
                    })
                }),
                expect.any(Object)
            );
        });
    });

    it('SHOULD open the location search modal when clicking search your delivery address', () => {
        const { getByText } = render(<AddDeliveryAddressScreen />);
        
        // Expand Apartment
        fireEvent.press(getByText('Apartment'));

        // Tap the search button
        fireEvent.press(getByText('Search your delivery address'));

        // Verify the location search modal title is displayed
        expect(getByText('Search Location')).toBeTruthy();
    });

    it('SHOULD show map button next to search button and navigate to map on press', () => {
        const { getByText, getByTestId } = render(<AddDeliveryAddressScreen />);
        
        // Expand Apartment
        fireEvent.press(getByText('Apartment'));

        // Find the map button
        const mapBtn = getByTestId('map-picker-btn-apartment');
        expect(mapBtn).toBeTruthy();

        // Tap the map button
        fireEvent.press(mapBtn);

        // Verify routing to map screen occurred
        expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
            pathname: '/(buyer)/profile/delivery/map',
            params: expect.objectContaining({
                mode: 'pick',
                type: 'apartment'
            })
        }));
    });
});
