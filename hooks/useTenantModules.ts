import { useTenantStore } from "@/stores/tenant";

/**
 * Hook to access tenant module flags.
 * Returns true (enabled) by default when tenant data is unavailable.
 */
export const useTenantModules = () => {
  const { tenant } = useTenantStore();

  return {
    isPaymentsEnabled: tenant?.modules?.payments ?? true,
    isDeliveryEnabled: tenant?.modules?.delivery ?? true,
    isRewardsEnabled: tenant?.modules?.rewards_referrals ?? true,
    isAffiliatesEnabled: tenant?.modules?.affiliates ?? true,
  };
};
