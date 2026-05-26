export interface PaymentMethod {
  id: string;
  image: any;
  name: string;
  nameKey?: string; // Translation key for the name
}

export interface PaymentCategory {
  id: string;
  name: string;
  nameKey?: string; // Translation key for the name
  image: any;
  methods?: PaymentMethod[];
}

export const PAYMENT_METHODS: PaymentCategory[] = [
  // {
  //   id: "tunzaa_instalments",
  //   name: "Pay in Instalments",
  //   nameKey: "payment.pay_in_instalments",
  //   image: require("@/assets/images/tunzaa.png"),
  //   methods: [
  //     {
  //       id: "245242jnr2n4i", // Tigo Pesa ID for instalments
  //       image: require("@/assets/images/payment/tigopesa.png"),
  //       name: "Tigo Pesa",
  //     },
  //     {
  //       id: "245242jnr2n4g", // Airtel Money ID for instalments
  //       image: require("@/assets/images/payment/airtel.png"),
  //       name: "Airtel Money",
  //     },
  //     {
  //       id: "mpesa-instalments",
  //       image: require("@/assets/images/payment/mpesa.jpeg"),
  //       name: "M-Pesa",
  //     },
  //     {
  //       id: "halopesa-instalments",
  //       image: require("@/assets/images/payment/halopesa.png"),
  //       name: "Halopesa",
  //     },
  //   ],
  // },
  {
    id: "tunzaa",
    name: "Pay Now",
    nameKey: "payment.pay_now",
    image: "qr_code", // Using component identifier
    methods: [
      {
        id: "245242jnr2n4i", // Tigo Pesa ID for instant payment
        image: require("@/assets/images/payment/tigopesa.png"),
        name: "Tigo Pesa",
      },
      {
        id: "245242jnr2n4g", // Airtel Money ID for instant payment
        image: require("@/assets/images/payment/airtel.png"),
        name: "Airtel Money",
      },
      {
        id: "mpesa",
        image: require("@/assets/images/payment/mpesa.jpeg"),
        name: "M-Pesa",
      },
      {
        id: "halopesa",
        image: require("@/assets/images/payment/halopesa.png"),
        name: "Halopesa",
      },
    ],
  },
  // {
  //   id: "cash_on_delivery",
  //   image: "cash_on_delivery", // Using component identifier
  //   name: "Cash on Delivery",
  // },
];

// Helper function to get payment methods for a specific category
export const getPaymentMethodsForCategory = (
  categoryId: string
): PaymentMethod[] => {
  const category = PAYMENT_METHODS.find((cat) => cat.id === categoryId);
  return category?.methods || [];
};

// Helper function to get payment method name by ID
// If a translation function is provided and the method has a nameKey, use translation
export const getPaymentMethodName = (
  methodId: string,
  t?: (key: string) => string
): string => {
  for (const category of PAYMENT_METHODS) {
    if (category.methods) {
      const method = category.methods.find((m) => m.id === methodId);
      if (method) {
        if (t && method.nameKey) {
          return t(method.nameKey);
        }
        return method.name;
      }
    }
  }
  return methodId;
};

// Helper function to get payment category name by ID
// If a translation function is provided and the category has a nameKey, use translation
export const getPaymentCategoryName = (
  categoryId: string,
  t?: (key: string) => string
): string => {
  const category = PAYMENT_METHODS.find((cat) => cat.id === categoryId);
  if (category) {
    if (t && category.nameKey) {
      return t(category.nameKey);
    }
    return category.name;
  }
  return categoryId;
};
