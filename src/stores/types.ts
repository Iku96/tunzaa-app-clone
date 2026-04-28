export interface Product {
  productId: number;
  tenantId: number;
  vendorId: number;
  sku: string;
  slug: string;
  status: "active" | "draft" | "archived";
  name: {
    en: string;
    sw: string;
  };
  description: {
    en: string;
    sw: string;
  };
  brand: {
    brandId: number;
    name: string;
  };
  categories: Array<{
    categoryId: number;
    name: string;
  }>;
  tags: string[];
  images: Array<{
    url: string;
    alt: string;
    position: number;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  variants: Array<{
    variantId: number;
    sku: string;
    attributes: Record<string, string>;
    price: {
      list: number;
      sale: number;
      currency: string;
    };
    inventory: {
      stockLevel: number;
      stockStatus: "in_stock" | "out_of_stock" | "low_stock";
    };
  }>;
  pricing: {
    currency: string;
    installments: {
      enabled: boolean;
      terms: Array<{
        months: number;
        feePercent: number;
      }>;
    };
  };
  promotions?: Array<{
    promotionId: number;
    type: "percentage" | "fixed_amount";
    value: number;
    validFrom: string;
    validTo: string;
  }>;
  shipping: {
    weightKg: number;
    dimensionsCm: {
      length: number;
      width: number;
      height: number;
    };
  };
  ratings: {
    average: number;
    count: number;
  };
  reviewsEnabled: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: number;
    updatedBy: number;
  };
}
