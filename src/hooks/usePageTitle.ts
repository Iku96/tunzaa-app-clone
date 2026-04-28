import { useEffect } from "react";
import { Platform } from "react-native";
import { useTenantStore } from "@/stores/tenant";

export function usePageTitle(pageName: string): void {
  const { tenant } = useTenantStore();

  useEffect(() => {
    if (Platform.OS === "web") {
      // Set dynamic page title
      const appName = tenant?.name || "Whitelabel Client";
      document.title = pageName ? `${pageName} | ${appName}` : appName;

      // Set dynamic favicon
      const faviconUrl = tenant?.branding?.theme?.logo?.icon || "/favicon.png";
      setTimeout(() => {
        let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          document.head.appendChild(faviconLink);
        }
        faviconLink.href = faviconUrl;
      }, 1000);
    }
  }, [pageName, tenant]);
}
