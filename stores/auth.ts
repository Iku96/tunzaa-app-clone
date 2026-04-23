import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  // Temporary state during registration flow
  registrationPhone: string | null;
  otpVerified: boolean;

  // Actions
  setRegistrationPhone: (phone: string) => void;
  setOtpVerified: (verified: boolean) => void;
  clearRegistrationState: () => void;
  getRegistrationPhone: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      registrationPhone: null,
      otpVerified: false,

      setRegistrationPhone: (phone) => set({ registrationPhone: phone }),
      setOtpVerified: (verified) => set({ otpVerified: verified }),
      clearRegistrationState: () =>
        set({ registrationPhone: null, otpVerified: false }),
      getRegistrationPhone: () => get().registrationPhone,
    }),
    {
      name: "auth-store", // unique name for localStorage key
      partialize: (state) => ({
        registrationPhone: state.registrationPhone,
        otpVerified: state.otpVerified,
      }),
    }
  )
);
