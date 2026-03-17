import { create } from "zustand";
import { addDays, addWeeks, addMonths, format } from "date-fns";

export type PaymentFrequency =
  | "daily"
  | "3days"
  | "weekly"
  | "2weeks"
  | "monthly";

export const frequencies: { id: PaymentFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: '3days', label: 'Every 3 Days' },
  { id: 'weekly', label: 'Weekly' },
  { id: '2weeks', label: 'Every 2 Weeks' },
  { id: 'monthly', label: 'Monthly' },
];

interface CheckoutState {
  selectedPaymentMethod: "tunzaa" | "mobile_money";
  selectedFrequency: PaymentFrequency;
  deliveryDate: string | null;
  isLoading: boolean;
  error: string | null;
  setPaymentMethod: (method: "tunzaa" | "mobile_money") => void;
  setPaymentFrequency: (frequency: PaymentFrequency) => void;
  setDeliveryDate: (date: string) => void;
  calculateInstallments: (amount: number) => Array<{
    installmentNumber: number;
    amount: number;
    dueDate: string;
  }>;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  selectedPaymentMethod: "tunzaa",
  selectedFrequency: "weekly",
  deliveryDate: null,
  isLoading: false,
  error: null,

  setPaymentMethod: (method) => {
    set({ selectedPaymentMethod: method });
  },

  setPaymentFrequency: (frequency) => {
    set({ selectedFrequency: frequency });
  },

  setDeliveryDate: (date) => {
    set({ deliveryDate: date });
  },

  calculateInstallments: (amount) => {
    const { selectedFrequency, deliveryDate } = get();
    if (!deliveryDate) return [];

    const targetDate = new Date(deliveryDate);
    const today = new Date();
    const daysDiff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const installments = 3; // Default to 3 installments
    const installmentAmount = Math.round(amount / installments);

    return Array.from({ length: installments }, (_, i) => {
      const installmentNumber = i + 1;
      let dueDate: Date;

      switch (selectedFrequency) {
        case "daily":
          dueDate = addDays(new Date(), installmentNumber);
          break;
        case "3days":
          dueDate = addDays(new Date(), installmentNumber * 3);
          break;
        case "weekly":
          dueDate = addWeeks(new Date(), installmentNumber);
          break;
        case "2weeks":
          dueDate = addWeeks(new Date(), installmentNumber * 2);
          break;
        case "monthly":
          dueDate = addMonths(new Date(), installmentNumber);
          break;
        default:
          dueDate = addWeeks(new Date(), installmentNumber);
      }

      return {
        installmentNumber,
        amount:
          installmentNumber === installments
            ? amount - installmentAmount * (installments - 1)
            : installmentAmount,
        dueDate: format(dueDate, "yyyy-MM-dd"),
      };
    });
  },
}));
