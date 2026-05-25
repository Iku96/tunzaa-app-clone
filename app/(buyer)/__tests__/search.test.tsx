import React from 'react';
import * as ImagePicker from 'expo-image-picker';

const mockProducts = [
    {
        product_id: 'prod-1',
        name: 'Alpha Watch',
        base_price: 30000,
        verification_status: 'approved',
        images: ['https://example.com/alpha.jpg'],
        store: { store_id: 'store-1', store_name: 'Store 1' },
        reviews: 5,
    },
    {
        product_id: 'prod-2',
        name: 'Beta Watch',
        base_price: 15000,
        verification_status: 'approved',
        images: ['https://example.com/beta.jpg'],
        store: { store_id: 'store-2', store_name: 'Store 2' },
        reviews: 10,
    },
    {
        product_id: 'prod-3',
        name: 'Gamma Watch',
        base_price: 45000,
        verification_status: 'approved',
        images: ['https://example.com/gamma.jpg'],
        store: { store_id: 'store-3', store_name: 'Store 3' },
        reviews: 2,
    }
];

// Place mocks at the very top of the file before importing the component
jest.mock('../../../src/services/products', () => ({
    productsApi: {
        searchProducts: jest.fn().mockImplementation(() => Promise.resolve({ items: mockProducts })),
        getProducts: jest.fn().mockImplementation(() => Promise.resolve({ items: mockProducts })),
    },
}));

jest.mock('@/src/services/products', () => ({
    productsApi: {
        searchProducts: jest.fn().mockImplementation(() => Promise.resolve({ items: mockProducts })),
        getProducts: jest.fn().mockImplementation(() => Promise.resolve({ items: mockProducts })),
    },
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({
        query: 'watch',
    }),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../../src/components/navigation/BottomNav', () => 'BottomNav');

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: 'gallery-image-uri' }] }),
    launchCameraAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: 'camera-image-uri' }] }),
    MediaTypeOptions: {
        Images: 'Images',
    },
}));

// Now import the component and testing library utilities
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchScreen from '../search/[query]';

describe('SearchScreen Image Search TDD', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD request media library permission and launch gallery when clicking Choose from your gallery', async () => {
        const { getByText, UNSAFE_getByProps } = render(<SearchScreen />);
        
        // 1. Open image search modal by pressing camera icon in search bar
        const cameraIcon = UNSAFE_getByProps({ name: 'camera-outline' });
        fireEvent.press(cameraIcon);

        // 2. Click "Choose from your gallery"
        const galleryBtn = getByText('Choose from your gallery');
        fireEvent.press(galleryBtn);

        // 3. Verify real ImagePicker is called
        await waitFor(() => {
            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });
    });

    it('SHOULD request camera permission and launch camera when clicking Take a photo', async () => {
        const { getByText, UNSAFE_getByProps } = render(<SearchScreen />);
        
        // 1. Open image search modal
        const cameraIcon = UNSAFE_getByProps({ name: 'camera-outline' });
        fireEvent.press(cameraIcon);

        // 2. Click "Take a photo"
        const cameraBtn = getByText('Take a photo');
        fireEvent.press(cameraBtn);

        // 3. Verify real ImagePicker is called
        await waitFor(() => {
            expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
        });
    });

    it('SHOULD sort products by price ascending when Price tab is clicked', async () => {
        const { getByText, queryAllByText } = render(<SearchScreen />);

        // Wait for results to load
        await waitFor(() => {
            expect(getByText('Alpha Watch')).toBeTruthy();
        });

        // Click Price tab
        const priceTab = getByText('Price');
        fireEvent.press(priceTab);

        // Verify elements are sorted: Beta Watch (15000), Alpha Watch (30000), Gamma Watch (45000)
        const watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Beta Watch');
        expect(watchTitles[1].props.children).toBe('Alpha Watch');
        expect(watchTitles[2].props.children).toBe('Gamma Watch');
    });

    it('SHOULD toggle price sort direction (ascending/descending) when clicking Price tab repeatedly', async () => {
        const { getByText, queryAllByText } = render(<SearchScreen />);

        await waitFor(() => {
            expect(getByText('Alpha Watch')).toBeTruthy();
        });

        const priceTab = getByText('Price');
        
        // 1st click -> priceAsc (Beta Watch (15000), Alpha Watch (30000), Gamma Watch (45000))
        fireEvent.press(priceTab);
        let watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Beta Watch');
        expect(watchTitles[2].props.children).toBe('Gamma Watch');

        // 2nd click -> priceDesc (Gamma Watch (45000), Alpha Watch (30000), Beta Watch (15000))
        fireEvent.press(priceTab);
        watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Gamma Watch');
        expect(watchTitles[2].props.children).toBe('Beta Watch');
    });

    it('SHOULD toggle Best matches sort direction (newest/oldest) when clicking Best matches tab repeatedly', async () => {
        const { getByText, queryAllByText } = render(<SearchScreen />);

        await waitFor(() => {
            expect(getByText('Alpha Watch')).toBeTruthy();
        });

        const matchesTab = getByText('Best matches');
        
        // Initial state is matchesDesc (Newest first: Gamma Watch (prod-3) first, Alpha Watch (prod-1) last)
        let watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Gamma Watch');
        expect(watchTitles[2].props.children).toBe('Alpha Watch');

        // 1st click -> matchesAsc (Oldest first: Alpha Watch (prod-1) first, Gamma Watch (prod-3) last)
        fireEvent.press(matchesTab);
        watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Alpha Watch');
        expect(watchTitles[2].props.children).toBe('Gamma Watch');

        // 2nd click -> matchesDesc (Newest first: Gamma Watch (prod-3) first, Alpha Watch (prod-1) last)
        fireEvent.press(matchesTab);
        watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Gamma Watch');
        expect(watchTitles[2].props.children).toBe('Alpha Watch');
    });

    it('SHOULD toggle Top sales sort direction (reviews desc/reviews asc) when clicking Top sales tab repeatedly', async () => {
        const { getByText, queryAllByText } = render(<SearchScreen />);

        await waitFor(() => {
            expect(getByText('Alpha Watch')).toBeTruthy();
        });

        const salesTab = getByText('Top sales');
        
        // 1st click -> salesDesc (Reviews descending: Beta Watch (10), Alpha Watch (5), Gamma Watch (2))
        fireEvent.press(salesTab);
        let watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Beta Watch');
        expect(watchTitles[2].props.children).toBe('Gamma Watch');

        // 2nd click -> salesAsc (Reviews ascending: Gamma Watch (2), Alpha Watch (5), Beta Watch (10))
        fireEvent.press(salesTab);
        watchTitles = queryAllByText(/Watch/);
        expect(watchTitles[0].props.children).toBe('Gamma Watch');
        expect(watchTitles[2].props.children).toBe('Beta Watch');
    });

    it('SHOULD display storefront fallback icon when vendor has no logo in gallery view', async () => {
        const { getByText, UNSAFE_queryAllByProps, getByTestId } = render(<SearchScreen />);

        await waitFor(() => {
            expect(getByText('Alpha Watch')).toBeTruthy();
        });

        // Switch to gallery view using filter button/toggle
        // Let's open filter modal
        const filterIcon = getByTestId('filter-button');
        fireEvent.press(filterIcon);

        // Press Gallery view option
        const galleryBtn = getByText('Gallery');
        fireEvent.press(galleryBtn);

        // Close Filter Modal
        const applyBtn = getByText('Apply');
        fireEvent.press(applyBtn);

        // Now verify storefront fallback icons are present
        const storefrontIcons = UNSAFE_queryAllByProps({ name: 'storefront' });
        expect(storefrontIcons.length).toBeGreaterThan(0);
    });
});
