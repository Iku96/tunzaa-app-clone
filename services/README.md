# API Implementation Summary

This document summarizes all the implemented APIs following the same pattern as `auth.ts`.

## File Structure

```
api/
├── types/
│   ├── index.ts          # Main types export file
│   ├── configuration.ts  # Configuration API types
│   ├── buyers.ts         # Buyer profile & delivery address types
│   ├── delivery.ts       # Delivery management types
│   ├── orders.ts         # Order management types
│   └── payments.ts       # Payment processing & installment types
├── configuration.ts      # Configuration APIs
├── buyers.ts            # Buyer profile & delivery address APIs
├── delivery.ts          # Delivery management APIs
├── orders.ts            # Order management APIs
└── payments.ts          # Payment processing & installment APIs
```

## Implemented APIs

### 1. Configuration APIs (`api/configuration.ts`)

- **Get Vehicle Types** - `GET /configuration/vehicle-types`
  - Hook: `useGetVehicleTypes(params, enabled?)`
  - Function: `configurationApi.getVehicleTypes(params)`

### 2. Buyer Profile & Delivery Address APIs (`api/buyers.ts`)

- **Get User's Delivery Addresses** - `GET /marketplace/buyers/user/{userId}`

  - Hook: `useGetBuyerProfile(userId, enabled?)`
  - Function: `buyersApi.getBuyerProfile(userId)`

- **Update User's Delivery Addresses** - `PUT /marketplace/buyers/user/{userId}`
  - Hook: `useUpdateBuyerProfile()`
  - Function: `buyersApi.updateBuyerProfile(userId, data)`

### 3. Delivery Management APIs (`api/delivery.ts`)

- **Get Delivery Types** - `GET /delivery-types`

  - Hook: `useGetDeliveryTypes(enabled?)`
  - Function: `deliveryApi.getDeliveryTypes()`

- **Get/Search Delivery Partners** - `GET /partners/`
  - Hook: `useGetDeliveryPartners(params?, enabled?)`
  - Function: `deliveryApi.getDeliveryPartners(params?)`

### 4. Order Management APIs (`api/orders.ts`)

- **Create Order** - `POST /orders/`

  - Hook: `useCreateOrder()`
  - Function: `ordersApi.createOrder(data)`

- **Get Buyer's Orders** - `GET /orders/`

  - Hook: `useGetOrders(params?, enabled?)`
  - Function: `ordersApi.getOrders(params?)`

- **Get Order** - `GET /orders/{orderId}`
  - Hook: `useGetOrder(orderId, enabled?)`
  - Function: `ordersApi.getOrder(orderId)`

### 5. Payment Processing & Installment APIs (`api/payments.ts`)

#### Payment Processing

- **Initiate Payment** - `POST /payments/initiate-payment`

  - Hook: `useInitiatePayment()`
  - Function: `paymentsApi.initiatePayment(data)`

- **Check Payment Status** - `GET /payments/check-status/{transactionId}`
  - Hook: `useCheckPaymentStatus(transactionId, enabled?)`
  - Function: `paymentsApi.checkPaymentStatus(transactionId)`

#### Installment Management

- **Create Installment Plan** - `POST /payments/installments/create`

  - Hook: `useCreateInstallmentPlan()`
  - Function: `paymentsApi.createInstallmentPlan(data)`

- **Get Payment Plan** - `GET /payments/installments/{planId}`

  - Hook: `useGetInstallmentPlan(planId, enabled?)`
  - Function: `paymentsApi.getInstallmentPlan(planId)`

- **Update Payment Plan** - `POST /payments/installments/{planId}/update`

  - Hook: `useUpdateInstallmentPlan()`
  - Function: `paymentsApi.updateInstallmentPlan(planId, data)`

- **Cancel Plan** - `DELETE /payments/installments/{planId}/cancel`
  - Hook: `useCancelInstallmentPlan()`
  - Function: `paymentsApi.cancelInstallmentPlan(planId)`

## Usage Examples

### Configuration

```typescript
import { useGetVehicleTypes } from "./api/configuration";

const { data: vehicleTypes, isLoading } = useGetVehicleTypes({
  tenant_id: "your-tenant-id",
  limit: 100,
});
```

### Buyer Profile

```typescript
import { useGetBuyerProfile, useUpdateBuyerProfile } from "./api/buyers";

const { data: profile } = useGetBuyerProfile(userId);
const updateProfile = useUpdateBuyerProfile();
```

### Orders

```typescript
import { useCreateOrder, useGetOrders } from "./api/orders";

const createOrder = useCreateOrder();
const { data: orders } = useGetOrders({ user_id: userId, status: "pending" });
```

### Payments

```typescript
import { useInitiatePayment, useCheckPaymentStatus } from "./api/payments";

const initiatePayment = useInitiatePayment();
const { data: paymentStatus } = useCheckPaymentStatus(transactionId);
```

## Notes

- All APIs follow the same pattern as `auth.ts`
- Types are organized in separate files within `api/types/`
- React Query hooks are provided for all APIs
- Query hooks have optional `enabled` parameter for conditional fetching
- Mutation hooks follow the standard React Query mutation pattern
