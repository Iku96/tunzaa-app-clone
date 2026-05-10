import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../../../app/(winga)/index';
import { useTunzaaAuth } from '../../../contexts/TunzaaAuthContext';

// Mock dependencies
jest.mock('../../../contexts/TunzaaAuthContext');
jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: null }), // Mock legacy auth as returning null (causes white screen loading forever)
}));
jest.mock('@/src/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', t: {} }),
}));
jest.mock('expo-router');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock UI components to prevent Jest parsing/transformation issues with third-party libraries
jest.mock('@/components/ui/text', () => {
  const { Text } = require('react-native');
  return { Text };
});
jest.mock('@/components/home/AffiliateHome', () => {
  const { View } = require('react-native');
  return { AffiliateHome: () => <View testID="affiliate-home" /> };
});
jest.mock('@rn-primitives/slot', () => ({}));

describe('Winga Onboarding and Login Screen Specs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render HomeScreen and utilize useTunzaaAuth rather than useAuth', async () => {
    // Mock TunzaaAuth to have a valid user
    (useTunzaaAuth as jest.Mock).mockReturnValue({
      user: {
        profiles: [{ role: 'winga', kyc: { verified: true } }],
      },
      isLoading: false,
      isAuthenticated: true,
    });

    const { queryByTestId } = render(<HomeScreen />);
    
    // We expect the loading spinner to be removed once AsyncStorage finishes checking onboarding status
    await waitFor(() => {
      expect(queryByTestId('loading-spinner')).toBeNull();
    });
  });
});
