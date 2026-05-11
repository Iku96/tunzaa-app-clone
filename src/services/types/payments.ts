// Payment Processing & Installment API Types

export interface InitiatePaymentBody {
  customer_msisdn: string;
  plan_id?: string;
}

// Payment Processing Types
export interface InitiatePaymentDirectlyBody {
  user_id: string;
  tenant_id: string;
  customer_msisdn: string;
  amount: number;
  reference: string;
}

//TODO: Sync this with backend
export interface InitiatePaymentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  transactionID: string;
}

export interface PaymentStatusResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    transactionID: string;
    status: "FAILED" | "PENDING" | "COMPLETED";
    amount: string;
    customerMsisdn: string;
    paymentDate?: string | null;
    utilityref?: string | null;
    remark?: string;
  };
}

// Installment Management Types
export interface InstallmentCustomer {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}

export interface CreateInstallmentPlanBody {
  customer: InstallmentCustomer;
  name: string;
  description: string;
  total_amount: number;
  payment_frequency: "daily" | "weekly" | "monthly" | "custom";
  start_date: string;
  end_date: string;
  custom_interval?: number;
}

export interface InstallmentCustomerResponse {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface InstallmentPlan {
  plan_id: number;
  customer: number;
  name: string;
  description: string;
  total_amount: string;
  paid_amount: string;
  remaining_balance: string;
  payment_frequency: string;
  start_date: string;
  end_date: string;
  custom_interval: number;
  status: string;
}

export interface Installment {
  installment_id: number;
  installment_number: number;
  amount: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InstallmentPlanResponse {
  customer: InstallmentCustomerResponse;
  plan: InstallmentPlan;
  installments: Installment[];
}

export interface UpdateInstallmentPlanBody {
  customer: InstallmentCustomer;
  name: string;
  description: string;
  total_amount: number;
  payment_frequency: "daily" | "weekly" | "monthly" | "custom";
  start_date: string;
  end_date: string;
  custom_interval?: number;
}
