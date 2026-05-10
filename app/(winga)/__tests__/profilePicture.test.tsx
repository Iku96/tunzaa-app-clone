import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Image } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-community/datetimepicker', () => {
    const { View } = require('react-native');
    return (props: any) => <View testID="date-picker" />;
});

// Mock the custom Text component to avoid @rn-primitives transform issues
jest.mock('@/components/ui/text', () => {
    const { Text } = require('react-native');
    return { Text };
});

jest.mock('date-fns', () => ({
    format: (date: any, fmt: string) => 'May 09, 2026',
}));

// Mock the auth context
const mockUser = {
    user_id: 'test-user-123',
    email: 'test@example.com',
    phone_number: '+255700000000',
    profiles: [{ role: 'winga', profile_id: 'winga-profile-1', kyc: { verified: true } }],
};

jest.mock('@/src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: mockUser,
        logout: jest.fn(),
    }),
}));

jest.mock('@/src/contexts/LanguageContext', () => ({
    useLanguage: () => ({ language: 'en' }),
}));

// Mock profile details with a profile_picture from the server
const MOCK_SERVER_LOGO = 'https://cdn.tunzaa.co.tz/uploads/winga-logo-abc123.jpg';
const UNSPLASH_PLACEHOLDER = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

jest.mock('@/hooks/useProfileDetails', () => ({
    useProfileDetails: () => ({
        affiliateDetails: {
            id: 'affiliate-123',
            name: 'Test Winga User',
            email: 'test@example.com',
            bio: 'Test bio',
            phone: '+255700000000',
            profile_picture: MOCK_SERVER_LOGO,
            status: 'active',
        },
        isLoading: false,
        hasErrors: false,
        errors: {},
        vendorDetails: null,
        deliveryDetails: null,
    }),
}));

jest.mock('@/src/services/affiliates', () => ({
    useGetAffiliateStats: () => ({
        data: { clicks: 10, orders: 5, total_earnings: 50000, conversion_rate: 50 },
        isLoading: false,
    }),
    useGetAffiliateLinks: () => ({
        data: { links: [], total: 0 },
        isLoading: false,
    }),
}));

// Import the component AFTER all mocks are set up
import { AffiliateHome } from '@/components/home/AffiliateHome';

// Helper: recursively find all Image source URIs from the rendered JSON tree
function findImageUris(node: any): string[] {
    const uris: string[] = [];
    if (!node) return uris;
    if (node.type === 'Image' && node.props?.source?.uri) {
        uris.push(node.props.source.uri);
    }
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            if (typeof child === 'object') {
                uris.push(...findImageUris(child));
            }
        }
    }
    return uris;
}

describe('Winga Profile Picture Persistence', () => {
    it('AffiliateHome should display server profile_picture instead of Unsplash placeholder', async () => {
        const component = render(<AffiliateHome />);

        await waitFor(() => {
            const tree = component.toJSON();
            const imageUris = findImageUris(tree);

            // The server profile_picture URL should be in the rendered tree
            expect(imageUris).toContain(MOCK_SERVER_LOGO);

            // The hardcoded Unsplash placeholder should NOT appear
            expect(imageUris).not.toContain(UNSPLASH_PLACEHOLDER);
        });
    });
});
