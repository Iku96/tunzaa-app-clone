import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<any> = {
  prefixes: ['myapp://', 'https://afrizon.africa'],
  config: {
    screens: {
      // Handle order deep links
      '(buyer)': {
        screens: {
          'orders': {
            screens: {
              '[id]': {
                path: 'order/:id',
                parse: {
                  id: (id: string) => id,
                },
              },
            },
          },
          // Handle product deep links with referral tracking
          'product': {
            screens: {
              '[id]': {
                path: 'product/:id',
                parse: {
                  id: (id: string) => id,
                },
              },
            },
          },
        },
      },
      // Handle public order links (for non-authenticated users)
      '(public)': {
        screens: {
          'order': {
            path: 'order/:id',
            parse: {
              id: (id: string) => id,
            },
          },
          // Handle public product links with referral tracking
          'product': {
            screens: {
              '[id]': {
                path: 'product/:id',
                parse: {
                  id: (id: string) => id,
                },
              },
            },
          },
        },
      },
    },
  },
  // Custom function to handle URL parsing
  getInitialURL() {
    // This will be called when the app is opened from a deep link
    return null;
  },
  // Custom function to subscribe to URL changes
  subscribe(listener) {
    // This will be called when the URL changes
    return () => {
      // Cleanup function
    };
  },
};

// Helper function to create order deep link URLs
export function createOrderDeepLinkUrl(orderId: string): string {
  return `myapp://order/${orderId}`;
}

// Helper function to create product deep link URLs
export function createProductDeepLinkUrl(productId: string): string {
  return `myapp://product/${productId}`;
}

// Helper function to create referral product URLs
export function createReferralProductUrl(productId: string, referralCode: string, tenantId: string): string {
  return `https://afrizon.africa/product/${productId}?ref=${referralCode}&tenant_id=${tenantId}`;
}

// Helper function to parse URL parameters
export function parseUrlParams(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// Helper function to extract referral information from URL
export function extractReferralInfo(url: string): { productId: string; referralCode?: string; tenantId?: string } | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');

    // Check if it's a product URL
    const productIndex = pathSegments.findIndex(segment => segment === 'product');
    if (productIndex !== -1 && pathSegments[productIndex + 1]) {
      const productId = pathSegments[productIndex + 1];
      const referralCode = urlObj.searchParams.get('ref');
      const tenantId = urlObj.searchParams.get('tenant_id');

      return {
        productId,
        referralCode: referralCode || undefined,
        tenantId: tenantId || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing referral URL:', error);
    return null;
  }
} 