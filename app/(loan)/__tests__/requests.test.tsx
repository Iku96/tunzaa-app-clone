import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import LoanRequestsScreen from '../requests';

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

describe('Loan Requests Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('should fetch requests and render only PENDING requests', async () => {
        const mockRequests = [
            {
                request_id: 'req-1',
                borrower_name: 'Pending Borrower',
                amount: 300000,
                purpose: 'Inventory Expansion',
                term_duration: 3,
                term_unit: 'Months',
                created_at: '2026-05-01T12:00:00Z',
                status: 'PENDING'
            },
            {
                request_id: 'req-2',
                borrower_name: 'Approved Borrower',
                amount: 500000,
                purpose: 'Emergency stock',
                term_duration: 6,
                term_unit: 'Months',
                created_at: '2026-05-02T12:00:00Z',
                status: 'APPROVED'
            }
        ];

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockRequests,
        });

        const { getByText, queryByText } = render(<LoanRequestsScreen />);

        // Wait for loading to finish and verify that only Pending Borrower is shown
        await waitFor(() => {
            expect(getByText('Pending Borrower')).toBeTruthy();
        });

        // Approved Borrower should NOT be rendered in the Pending Requests screen
        expect(queryByText('Approved Borrower')).toBeNull();

        // Verify fallback mock data is not shown
        expect(queryByText('Lilian Mwangi')).toBeNull();
    });
});
