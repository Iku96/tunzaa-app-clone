import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthGuard } from '../AuthGuard';
import { useTunzaaAuth } from '../../../contexts/TunzaaAuthContext';
import { useRouter, useSegments } from 'expo-router';

// Mock dependencies
jest.mock('../../../contexts/TunzaaAuthContext');
jest.mock('expo-router');
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('AuthGuard Redirection', () => {
    const mockReplace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            replace: mockReplace,
        });
    });

    it('should redirect unauthenticated users in protected portals to /login', () => {
        // Setup: Not authenticated, in (vendor) portal
        (useTunzaaAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            user: null,
        });
        (useSegments as jest.Mock).mockReturnValue(['(vendor)', 'dashboard']);

        render(
            <AuthGuard>
                <></>
            </AuthGuard>
        );

        // Expectation: Should redirect to /language
        expect(mockReplace).toHaveBeenCalledWith('/language');
    });
});
