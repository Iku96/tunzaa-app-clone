import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTenantModules } from '@/hooks/useTenantModules';

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'rejected'
  | 'shipped'
  | 'picked_up'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded'
  | 'partially_refunded';

export type PaymentStatus = 
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  timestamp?: string;
  color: string;
}

interface OrderTimelineProps {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  userRole: 'buyer' | 'vendor';
  createdAt: string;
  paidAt?: string;
  fulfilledAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  isDeliveryEnabled?: boolean;
  isPaymentsEnabled?: boolean;
}

const getTimelineSteps = (
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
  userRole: 'buyer' | 'vendor',
  timestamps: {
    createdAt: string;
    paidAt?: string;
    fulfilledAt?: string;
    cancelledAt?: string;
    refundedAt?: string;
  },
  isDeliveryEnabled: boolean = true,
  isPaymentsEnabled: boolean = true
): TimelineStep[] => {
  const normalizedOrderStatus = orderStatus.toLowerCase();
  const normalizedPaymentStatus = paymentStatus.toLowerCase();
  const isRefundFlow = ['refund_requested', 'refunded', 'partially_refunded'].includes(normalizedOrderStatus);
  
  if (userRole === 'buyer') {
    const buyerSteps: TimelineStep[] = [
      {
        id: 'order_placed',
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        icon: Package,
        status: 'completed',
        timestamp: timestamps.createdAt,
        color: '#22c55e'
      },
      {
        id: 'payment_processing',
        title: 'Payment Processing',
        description: normalizedPaymentStatus === 'paid' ? 'Payment completed' : 'Processing payment',
        icon: CreditCard,
        status: normalizedPaymentStatus === 'paid' ? 'completed' : 
                normalizedPaymentStatus === 'failed' ? 'skipped' : 'current',
        timestamp: timestamps.paidAt,
        color: normalizedPaymentStatus === 'paid' ? '#22c55e' : '#eab308'
      },
      {
        id: 'vendor_confirmation',
        title: 'Vendor Confirmation',
        description: normalizedOrderStatus === 'confirmed' ? 'Order confirmed by vendor' :
                   normalizedOrderStatus === 'rejected' ? 'Order rejected by vendor' :
                   'Waiting for vendor confirmation',
        icon: CheckCircle,
        status: normalizedOrderStatus === 'confirmed' ? 'completed' :
                normalizedOrderStatus === 'rejected' ? 'skipped' :
                ['pending', 'processing'].includes(normalizedOrderStatus) ? 'current' : 'pending',
        color: normalizedOrderStatus === 'confirmed' ? '#22c55e' : 
               normalizedOrderStatus === 'rejected' ? '#ef4444' : '#eab308'
      },
      {
        id: 'preparing_order',
        title: 'Preparing Order',
        description: 'Your order is being prepared',
        icon: Package,
        status: ['confirmed', 'shipped', 'delivered', 'completed'].includes(normalizedOrderStatus) ? 'completed' :
                normalizedOrderStatus === 'rejected' ? 'skipped' : 'pending',
        color: ['confirmed', 'shipped', 'delivered', 'completed'].includes(normalizedOrderStatus) ? '#22c55e' : '#6b7280'
      },
      {
        id: 'shipped',
        title: 'Order Shipped',
        description: 'Your order is on the way',
        icon: Truck,
        status: ['shipped', 'picked_up', 'delivered', 'completed'].includes(normalizedOrderStatus) ? 'completed' :
                ['cancelled', 'rejected'].includes(normalizedOrderStatus) ? 'skipped' : 'pending',
        color: ['shipped', 'picked_up', 'delivered', 'completed'].includes(normalizedOrderStatus) ? '#22c55e' : '#6b7280'
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Order delivered to your address',
        icon: MapPin,
        status: ['delivered', 'completed'].includes(normalizedOrderStatus) ? 'completed' :
                ['cancelled', 'rejected'].includes(normalizedOrderStatus) ? 'skipped' : 'pending',
        timestamp: timestamps.fulfilledAt,
        color: ['delivered', 'completed'].includes(normalizedOrderStatus) ? '#22c55e' : '#6b7280'
      },
      {
        id: 'completed',
        title: 'Order Completed',
        description: 'Order successfully completed',
        icon: CheckCircle,
        status: normalizedOrderStatus === 'completed' ? 'completed' : 'pending',
        color: normalizedOrderStatus === 'completed' ? '#22c55e' : '#6b7280'
      }
    ];

    // Filter out delivery-related steps if delivery is disabled
    const deliveryStepIds = ['preparing_order', 'shipped', 'delivered'];
    const paymentStepIds = ['payment_processing'];
    let filteredSteps = buyerSteps.filter(step => {
      if (!isDeliveryEnabled && deliveryStepIds.includes(step.id)) return false;
      if (!isPaymentsEnabled && paymentStepIds.includes(step.id)) return false;
      return true;
    });

    // Add refund steps if needed
    if (isRefundFlow) {
      filteredSteps.push({
        id: 'refund_requested',
        title: 'Refund Requested',
        description: 'Refund has been requested',
        icon: RefreshCw,
        status: ['refund_requested', 'refunded', 'partially_refunded'].includes(normalizedOrderStatus) ? 'completed' : 'pending',
        color: '#f59e0b'
      });

      if (normalizedOrderStatus === 'refunded' || normalizedOrderStatus === 'partially_refunded') {
        filteredSteps.push({
          id: 'refunded',
          title: normalizedOrderStatus === 'partially_refunded' ? 'Partially Refunded' : 'Refunded',
          description: 'Refund has been processed',
          icon: CheckCircle,
          status: 'completed',
          timestamp: timestamps.refundedAt,
          color: '#22c55e'
        });
      }
    }

    // Add cancelled step if needed
    if (normalizedOrderStatus === 'cancelled') {
      filteredSteps.push({
        id: 'cancelled',
        title: 'Order Cancelled',
        description: 'Order has been cancelled',
        icon: XCircle,
        status: 'completed',
        timestamp: timestamps.cancelledAt,
        color: '#ef4444'
      });
    }

    return filteredSteps;
  } else {
    // Vendor timeline
    const vendorSteps: TimelineStep[] = [
      {
        id: 'order_received',
        title: 'Order Received',
        description: 'New order received from customer',
        icon: Package,
        status: 'completed',
        timestamp: timestamps.createdAt,
        color: '#22c55e'
      },
      {
        id: 'payment_verification',
        title: 'Payment Verification',
        description: normalizedPaymentStatus === 'paid' ? 'Payment verified' : 'Verifying payment',
        icon: CreditCard,
        status: normalizedPaymentStatus === 'paid' ? 'completed' : 
                normalizedPaymentStatus === 'failed' ? 'skipped' : 'current',
        timestamp: timestamps.paidAt,
        color: normalizedPaymentStatus === 'paid' ? '#22c55e' : '#eab308'
      },
      {
        id: 'vendor_response',
        title: 'Your Response Required',
        description: normalizedOrderStatus === 'confirmed' ? 'Order accepted' :
                   normalizedOrderStatus === 'rejected' ? 'Order rejected' :
                   'Accept or reject this order',
        icon: AlertCircle,
        status: ['confirmed', 'rejected'].includes(normalizedOrderStatus) ? 'completed' :
                ['pending', 'processing'].includes(normalizedOrderStatus) ? 'current' : 'pending',
        color: normalizedOrderStatus === 'confirmed' ? '#22c55e' : 
               normalizedOrderStatus === 'rejected' ? '#ef4444' : '#eab308'
      },
      {
        id: 'prepare_order',
        title: 'Prepare Order',
        description: 'Prepare items for shipment',
        icon: Package,
        status: ['confirmed', 'shipped', 'delivered', 'completed'].includes(normalizedOrderStatus) ? 'completed' :
                normalizedOrderStatus === 'rejected' ? 'skipped' : 'pending',
        color: ['confirmed', 'shipped', 'delivered', 'completed'].includes(normalizedOrderStatus) ? '#22c55e' : '#6b7280'
      },
      {
        id: 'ready_for_pickup',
        title: 'Ready for Pickup',
        description: 'Order ready for delivery partner',
        icon: Truck,
        status: ['shipped', 'picked_up', 'delivered', 'completed'].includes(normalizedOrderStatus) ? 'completed' :
                ['cancelled', 'rejected'].includes(normalizedOrderStatus) ? 'skipped' : 'pending',
        color: ['shipped', 'picked_up', 'delivered', 'completed'].includes(normalizedOrderStatus) ? '#22c55e' : '#6b7280'
      },
      {
        id: 'picked_up',
        title: 'Picked Up',
        description: 'Order picked up by delivery partner',
        icon: Truck,
        status: ['picked_up', 'delivered', 'completed'].includes(normalizedOrderStatus) ? 'completed' :
                ['cancelled', 'rejected'].includes(normalizedOrderStatus) ? 'skipped' : 'pending',
        color: ['picked_up', 'delivered', 'completed'].includes(normalizedOrderStatus) ? '#22c55e' : '#6b7280'
      },
      {
        id: 'order_delivered',
        title: 'Order Delivered',
        description: 'Order delivered to customer',
        icon: MapPin,
        status: ['delivered', 'completed'].includes(normalizedOrderStatus) ? 'completed' :
                ['cancelled', 'rejected'].includes(normalizedOrderStatus) ? 'skipped' : 'pending',
        timestamp: timestamps.fulfilledAt,
        color: ['delivered', 'completed'].includes(normalizedOrderStatus) ? '#22c55e' : '#6b7280'
      },
      {
        id: 'order_completed',
        title: 'Order Completed',
        description: 'Order successfully completed',
        icon: CheckCircle,
        status: normalizedOrderStatus === 'completed' ? 'completed' : 'pending',
        color: normalizedOrderStatus === 'completed' ? '#22c55e' : '#6b7280'
      }
    ];

    // Filter out delivery-related steps if delivery is disabled
    const deliveryStepIds = ['prepare_order', 'ready_for_pickup', 'order_delivered'];
    const paymentStepIds = ['payment_verification'];
    let filteredSteps = vendorSteps.filter(step => {
      if (!isDeliveryEnabled && deliveryStepIds.includes(step.id)) return false;
      if (!isPaymentsEnabled && paymentStepIds.includes(step.id)) return false;
      return true;
    });

    // Add refund steps if needed
    if (isRefundFlow) {
      filteredSteps.push({
        id: 'refund_requested',
        title: 'Refund Requested',
        description: 'Customer requested refund',
        icon: RefreshCw,
        status: ['refund_requested', 'refunded', 'partially_refunded'].includes(normalizedOrderStatus) ? 'completed' : 'pending',
        color: '#f59e0b'
      });

      if (normalizedOrderStatus === 'refunded' || normalizedOrderStatus === 'partially_refunded') {
        filteredSteps.push({
          id: 'refunded',
          title: normalizedOrderStatus === 'partially_refunded' ? 'Partially Refunded' : 'Refunded',
          description: 'Refund processed',
          icon: CheckCircle,
          status: 'completed',
          timestamp: timestamps.refundedAt,
          color: '#22c55e'
        });
      }
    }

    // Add cancelled step if needed
    if (normalizedOrderStatus === 'cancelled') {
      filteredSteps.push({
        id: 'cancelled',
        title: 'Order Cancelled',
        description: 'Order has been cancelled',
        icon: XCircle,
        status: 'completed',
        timestamp: timestamps.cancelledAt,
        color: '#ef4444'
      });
    }

    return filteredSteps;
  }
};

const getStatusBadgeVariant = (status: TimelineStep['status']) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'current':
      return 'outline';
    case 'skipped':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orderStatus,
  paymentStatus,
  userRole,
  createdAt,
  paidAt,
  fulfilledAt,
  cancelledAt,
  refundedAt,
  className = '',
  collapsible = true,
  defaultExpanded = false,
  isDeliveryEnabled: isDeliveryEnabledProp,
  isPaymentsEnabled: isPaymentsEnabledProp
}) => {
  const { isDeliveryEnabled: isDeliveryEnabledModule, isPaymentsEnabled: isPaymentsEnabledModule } = useTenantModules();
  const isDeliveryEnabled = isDeliveryEnabledProp ?? isDeliveryEnabledModule;
  const isPaymentsEnabled = isPaymentsEnabledProp ?? isPaymentsEnabledModule;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const steps = getTimelineSteps(
    orderStatus,
    paymentStatus,
    userRole,
    {
      createdAt,
      paidAt,
      fulfilledAt,
      cancelledAt,
      refundedAt
    },
    isDeliveryEnabled,
    isPaymentsEnabled
  );

  const renderCollapsedView = () => {
    const currentStep = steps.find(step => step.status === 'current') || steps[steps.length - 1];
    
    if (!currentStep) {
      return <Text className="text-muted-foreground">No timeline data available</Text>;
    }
    
    return (
      <View className="flex-col gap-4 items-center justify-between">
        <View className="flex-row items-center space-x-2">
          {steps.slice(0, Math.min(5, steps.length)).map((step, index) => {
            const IconComponent = step.icon;
            
            return (
              <View key={step.id} className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-500' :
                    step.status === 'current' ? 'bg-blue-500' :
                    step.status === 'skipped' ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                >
                  <IconComponent
                    size={12}
                    color="white"
                  />
                </View>
                {index < Math.min(4, steps.length - 1) && (
                  <View className={`w-4 h-px ${
                    steps[index + 1]?.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  } mx-1`} />
                )}
              </View>
            );
          })}
          {steps.length > 5 && (
            <Text className="text-xs text-muted-foreground ml-1">+{steps.length - 5}</Text>
          )}
        </View>
        
        <View className="flex-row items-center space-x-2">
          <Text className="text-sm font-medium text-foreground">
            {currentStep.title}
          </Text>
          <Badge variant={getStatusBadgeVariant(currentStep.status)} className="ml-2">
            <Text className="text-xs font-semibold capitalize text-foreground">
              {orderStatus.replace('_', ' ')}
            </Text>
          </Badge>
        </View>
      </View>
    );
  };

  const renderExpandedView = () => (
    <View className="space-y-4">
      {steps.map((step, index) => {
        const IconComponent = step.icon;
        const isLast = index === steps.length - 1;
        
        return (
          <View key={step.id}>
            <View className="flex-row items-start">
              <View className="mr-3 items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-500' :
                    step.status === 'current' ? 'bg-blue-500' :
                    step.status === 'skipped' ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                >
                  <IconComponent
                    size={16}
                    color="white"
                  />
                </View>
                {!isLast && (
                  <View className="w-px h-8 bg-gray-300 mt-2" />
                )}
              </View>
              
              <View className="flex-1">
                <Text className={`font-semibold ${
                  step.status === 'completed' ? 'text-green-600' :
                  step.status === 'current' ? 'text-blue-600' :
                  step.status === 'skipped' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </Text>
                {step.timestamp && (
                  <Text className="text-xs text-muted-foreground mt-1">
                    {format(new Date(step.timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                  </Text>
                )}
              </View>
            </View>
            {!isLast && <View className="h-2" />}
          </View>
        );
      })}
    </View>
  );

  return (
    <Card className={`p-4 ${className}`}>
      <TouchableOpacity 
        onPress={() => collapsible && setIsExpanded(!isExpanded)}
        disabled={!collapsible}
        className="mb-4"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-foreground">
            Order Timeline
          </Text>
          {collapsible && (
            <View className="flex-row items-center space-x-2">
              {isExpanded ? (
                <ChevronUp size={20} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={20} className="text-muted-foreground" />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isExpanded || !collapsible ? renderExpandedView() : renderCollapsedView()}
    </Card>
  );
};

export default OrderTimeline; 