import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LoanHistoryScreen from '../history';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/src/utils/storage', () => ({
    getAccessToken: jest.fn().mockResolvedValue('fake-token'),
}));

describe('Loan History Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('should fetch history from /loans/repayments/ and render dynamic data', async () => {
        const mockRepayments = [
            {
                id: 'rep-1',
                borrower_name: 'Test Borrower A',
                total_repayment: 200000,
                interest_rate: 5,
                term_duration: '3 Months',
                created_at: '2026-05-01T12:00:00Z',
                balance: 100000,
                status: 'Active'
            },
            {
                id: 'rep-2',
                borrower_name: 'Test Borrower B',
                total_repayment: 500000,
                interest_rate: 8,
                term_duration: '6 Months',
                created_at: '2026-05-02T12:00:00Z',
                balance: 0,
                status: 'Paid'
            }
        ];

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockRepayments,
        });

        const { getByText, queryByText } = render(<LoanHistoryScreen />);

        // Wait for loading to finish and live data to render
        await waitFor(() => {
            expect(getByText('Test Borrower A')).toBeTruthy();
            expect(getByText('Test Borrower B')).toBeTruthy();
        });

        // Verify that global fetch was called with /loans/repayments/
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/loans/repayments/'),
            expect.any(Object)
        );

        // Verify mock fallback data is not displayed
        expect(queryByText('Amani Joseph')).toBeNull();
    });
});
