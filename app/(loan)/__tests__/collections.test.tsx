import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LoanCollectionsScreen from '../collections';

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

describe('Loan Collections Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('should fetch repayments and compute outstanding and recovered amounts dynamically', async () => {
        const mockRepayments = [
            {
                id: 'col-1',
                borrower_name: 'Borrower A',
                amount_paid: 150000,
                total_repayment: 500000,
                balance: 350000,
                created_at: '2026-05-01T12:00:00Z'
            },
            {
                id: 'col-2',
                borrower_name: 'Borrower B',
                amount_paid: 200000,
                total_repayment: 200000,
                balance: 0,
                created_at: '2026-05-02T12:00:00Z'
            }
        ];

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockRepayments,
        });

        const { getByText, getAllByText, queryByText } = render(<LoanCollectionsScreen />);

        // Wait for rendering and assert dynamically calculated values:
        // totalRecovered = 150,000 + 200,000 = 350,000
        // outstanding = 350,000 + 0 = 350,000
        await waitFor(() => {
            expect(getAllByText('Tsh. 350,000').length).toBeGreaterThanOrEqual(1);
            expect(getByText('Outstanding recoverables: Tsh. 350,000')).toBeTruthy();
        });

        // Verify that the fallback hardcoded outstanding amount (17,960,000) is NOT shown
        expect(queryByText('Outstanding recoverables: Tsh. 17,960,000')).toBeNull();
    });
});
