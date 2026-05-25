import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../../src/services/auth';

const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

// Mock Auth context
const mockUser = {
    user_id: 'buyer-user-777',
    id: 'buyer-user-777',
    first_name: 'John',
    last_name: 'Doe',
    display_name: 'John Doe',
    email: 'john@example.com'
};

jest.mock('../../../src/contexts/TunzaaAuthContext', () => ({
    useTunzaaAuth: () => ({
        user: mockUser,
        isAuthenticated: true,
        refreshProfile: jest.fn()
    })
}));

// Mock Language context
jest.mock('../../../src/contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => key,
        locale: 'en'
    })
}));

// Mock marketplace hooks
jest.mock('../../../src/hooks/useMarketplace', () => ({
    useMarketplace: () => ({
        products: [],
        loading: false
    })
}));

jest.mock('../../../src/services/tenant', () => ({
    useBanners: () => ({
        data: [],
        isLoading: false
    })
}));

jest.mock('../../../src/hooks/useProfileCompletion', () => ({
    useProfileCompletion: () => ({
        percentage: 100,
        missingFields: []
    })
}));

// Mock APIs
jest.mock('../../../src/services/auth', () => ({
    authApi: {
        getUserDetails: jest.fn()
    }
}));

// Mock cart and other dependencies
jest.mock('../../../src/stores/cart', () => ({
    useCartCombined: () => ({
        cart: null,
        isLoading: false,
        refetch: jest.fn()
    }),
    useClearCart: () => ({
        mutateAsync: jest.fn()
    })
}));

jest.mock('../../../src/services/buyers', () => ({
    useGetBuyerOrders: () => ({
        data: [],
        isLoading: false
    })
}));

jest.mock('../../../src/components/navigation/BottomNav', () => 'BottomNav');

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn()
    }),
    useFocusEffect: (cb: any) => cb()
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

import AccountScreen from '../account';

describe('Buyer Location Persistence and Key Alignment', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
    });

    it('SHOULD load location using preferred_location key from API metadata', async () => {
        (authApi.getUserDetails as jest.Mock).mockResolvedValue({
            profiles: [
                {
                    role: 'buyer',
                    metadata: {
                        preferred_location: 'Arusha Preferred API',
                        location: 'Dar es Salaam API Fallback'
                    }
                }
            ]
        });

        const { getByText } = render(<AccountScreen />);

        await waitFor(() => {
            expect(getByText(/Arusha Preferred API/)).toBeTruthy();
        });
    });

    it('SHOULD load location using preferred_location key from local storage when API preferred_location is not available', async () => {
        (authApi.getUserDetails as jest.Mock).mockResolvedValue({
            profiles: [
                {
                    role: 'buyer',
                    metadata: {
                        location: 'Dar es Salaam API Fallback'
                    }
                }
            ]
        });

        // Set local storage extra metadata
        await AsyncStorage.setItem(
            `${PROFILE_EXTRAS_KEY}_buyer-user-777`,
            JSON.stringify({
                preferred_location: 'Mwanza Local Preferred',
                location: 'Dar Local Fallback'
            })
        );

        const { getByText } = render(<AccountScreen />);

        await waitFor(() => {
            expect(getByText(/Mwanza Local Preferred/)).toBeTruthy();
        });
    });
});
