import { router } from "expo-router";

/**
 * Server-truth routing for Tunzaa roles
 */
export const getRouteByRole = (role: string | null) => {
  if (!role) return "/(auth)/login";

  switch (role.toLowerCase()) {
    case "admin":
      return "/(admin)/dashboard";
    case "merchant":
    case "vendor":
    case "business":
      return "/(vendor)/dashboard";
    case "affiliate":
    case "winga":
      return "/(affiliate)/index";
    case "buyer":
    case "customer":
      return "/(buyer)/home";
    default:
      return "/(buyer)/home";
  }
};

/**
 * Centralized navigation based on server-verified session
 */
export const navigateBySession = (sessionData: { active_role: string | null }) => {
  const targetRoute = getRouteByRole(sessionData.active_role);
  console.log(`[Router] Navigating to ${targetRoute} for role: ${sessionData.active_role}`);
  router.replace(targetRoute as any);
};
