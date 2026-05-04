import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface LoanProduct {
    id: string;
    title: string;
    description: string;
    icon_name: string; // Refers to Lucide icon name
}

export interface LoanProvider {
    id: string;
    name: string;
    logo_url?: string;
    loan_term: string;
    monthly_interest: string;
    min_amount: number;
    max_amount: number;
}

// Mock Data for Phase 1
const MOCK_LOAN_PRODUCTS: LoanProduct[] = [
    {
        id: "prod_1",
        title: "Product Capital Loan",
        description: "Finance your inventory purchases and manage your cash flow effectively.",
        icon_name: "Package"
    },
    {
        id: "prod_2",
        title: "Empower Yourself Loan",
        description: "Fuel your business growth, expansion, and long-term projects.",
        icon_name: "Rocket"
    },
    {
        id: "prod_3",
        title: "Stock Loan",
        description: "Secure financing against your existing stock and assets.",
        icon_name: "Layers"
    }
];

const MOCK_LOAN_PROVIDERS: LoanProvider[] = [
    {
        id: "prov_1",
        name: "Aramex Financial Services Limited",
        logo_url: "https://ui-avatars.com/api/?name=Aramex&background=425BA4&color=fff",
        loan_term: "12months",
        monthly_interest: "5.00%",
        min_amount: 100000,
        max_amount: 2000000
    },
    {
        id: "prov_2",
        name: "Bill Electronics",
        logo_url: "https://ui-avatars.com/api/?name=Bill+E&background=6B7280&color=fff",
        loan_term: "12months",
        monthly_interest: "5.00%",
        min_amount: 100000,
        max_amount: 2000000
    },
    {
        id: "prov_3",
        name: "Bill Finance",
        logo_url: "https://ui-avatars.com/api/?name=Bill+F&background=01AC00&color=fff",
        loan_term: "3 months",
        monthly_interest: "10.00%",
        min_amount: 10000,
        max_amount: 500000
    },
    {
        id: "prov_4",
        name: "MicroSoft Loan",
        logo_url: "https://ui-avatars.com/api/?name=MS&background=EF4444&color=fff",
        loan_term: "3 months",
        monthly_interest: "10.00%",
        min_amount: 10000,
        max_amount: 500000
    }
];

export const loansApi = {
    getLoanProducts: async (): Promise<LoanProduct[]> => {
        // In the future, this will be:
        // const response = await apiClient.get<{ data: LoanProduct[] }>('/loans/products');
        // return response.data.data;
        
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_LOAN_PRODUCTS);
            }, 800);
        });
    },

    getLoanProviders: async (productId: string): Promise<LoanProvider[]> => {
        // In the future, this will be:
        // const response = await apiClient.get<{ data: LoanProvider[] }>(`/loans/providers?product_id=${productId}`);
        // return response.data.data;

        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // For now, return the same mock list for any product
                resolve(MOCK_LOAN_PROVIDERS);
            }, 800);
        });
    },

    submitLoanRequest: async (data: any): Promise<any> => {
        // In the future:
        // const response = await apiClient.post('/loans/requests', data);
        // return response.data;

        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: 'success', message: 'Loan request submitted successfully' });
            }, 1500);
        });
    },

    getLoanRepaymentPlan: async (loanId: string): Promise<LoanRepaymentPlan> => {
        // In the future:
        // const response = await apiClient.get<LoanRepaymentPlan>(`/loans/repayments/${loanId}`);
        // return response.data;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_REPAYMENT_PLAN);
            }, 800);
        });
    },

    getLoanRepayments: async (): Promise<LoanRepaymentPlan[]> => {
        // For the listing page
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([MOCK_REPAYMENT_PLAN]);
            }, 800);
        });
    },

    processLoanPayment: async (data: any): Promise<any> => {
        // In the future:
        // const response = await apiClient.post('/loans/payments', data);
        // return response.data;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: 'success', message: 'Payment processed successfully' });
            }, 2000);
        });
    }
};

// React Query Hooks
export const useGetLoanProducts = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ["loanProducts"],
        queryFn: () => loansApi.getLoanProducts(),
        enabled: enabled,
    });
};

export const useGetLoanProviders = (productId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["loanProviders", productId],
        queryFn: () => loansApi.getLoanProviders(productId),
        enabled: enabled && !!productId,
    });
};

import { useMutation } from "@tanstack/react-query";

export const useSubmitLoanRequest = () => {
    return useMutation({
        mutationFn: (data: any) => loansApi.submitLoanRequest(data),
    });
};

export const useGetLoanRepaymentPlan = (loanId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["loanRepaymentPlan", loanId],
        queryFn: () => loansApi.getLoanRepaymentPlan(loanId),
        enabled: enabled && !!loanId,
    });
};

export const useGetLoanRepayments = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ["loanRepayments"],
        queryFn: () => loansApi.getLoanRepayments(),
        enabled: enabled,
    });
};

export const useProcessLoanPayment = () => {
    return useMutation({
        mutationFn: (data: any) => loansApi.processLoanPayment(data),
    });
};

// Mock Data for Repayments
export interface LoanRepaymentPlan {
    id: string;
    application_id: string;
    provider_name: string;
    interest_rate: string;
    loan_term: string;
    total_repayment: number;
    amount_paid: number;
    progress_percentage: number;
    status: 'active' | 'completed';
    payments_made: number;
    total_payments: number;
    schedule: Array<{
        id: string;
        payment_number: number;
        due_date: string;
        amount: number;
        status: 'paid' | 'pending' | 'overdue';
    }>;
}

const MOCK_REPAYMENT_PLAN: LoanRepaymentPlan = {
    id: 'REP-84391',
    application_id: '#LN-84391',
    provider_name: 'Bill Finance',
    interest_rate: '5.00% / month',
    loan_term: '3 Months',
    total_repayment: 575000,
    amount_paid: 250000,
    progress_percentage: 100, // Matching the screenshot showing 100% and 5 of 5 payments
    status: 'completed',
    payments_made: 5,
    total_payments: 5,
    schedule: [
        { id: 'S1', payment_number: 1, due_date: '12/04/2025', amount: 50000, status: 'paid' },
        { id: 'S2', payment_number: 2, due_date: '12/05/2025', amount: 50000, status: 'paid' },
        { id: 'S3', payment_number: 3, due_date: '12/06/2025', amount: 50000, status: 'paid' },
        { id: 'S4', payment_number: 4, due_date: '12/07/2025', amount: 50000, status: 'paid' },
        { id: 'S5', payment_number: 5, due_date: '12/08/2025', amount: 50000, status: 'paid' },
    ]
};
