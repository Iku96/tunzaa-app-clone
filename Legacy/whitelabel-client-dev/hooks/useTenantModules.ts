import { useTenantStore } from "@/stores/tenant";

/**
 * Hook to access tenant module flags.
 * Returns true (enabled) by default when tenant data is unavailable.
 */
export const useTenantModules = () => {
  // Use direct selector to avoid creating new object references
  // that cause useSyncExternalStore errors in Zustand v5
  const tenant = useTenantStore((state) => state.tenant);

  return {
    isPaymentsEnabled: tenant?.modules?.payments ?? true,
    isDeliveryEnabled: tenant?.modules?.delivery ?? true,
    isRewardsEnabled: tenant?.modules?.rewards_referrals ?? true,
    isAffiliatesEnabled: tenant?.modules?.affiliates ?? true,
  };
};
