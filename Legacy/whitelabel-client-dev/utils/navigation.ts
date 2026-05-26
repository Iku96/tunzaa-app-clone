import { UserRole } from "@/services/types";

export const navigateToRoleHome = (router: any, role: UserRole) => {
  switch (role) {
    case "buyer":
      router.replace("/(buyer)");
      break;
    case "vendor":
      router.replace("/(vendor)");
      break;
    case "delivery":
      router.replace("/(delivery)");
      break;
    case "winga":
      router.replace("/(winga)");
      break;
    default:
      router.replace("/(buyer)");
  }
};

export const getHomeRouteForRole = (role: UserRole): string => {
  switch (role) {
    case "buyer":
      return "/(buyer)";
    case "vendor":
      return "/(vendor)";
    case "delivery":
      return "/(delivery)";
    case "winga":
      return "/(winga)";
    default:
      return "/(buyer)";
  }
};
