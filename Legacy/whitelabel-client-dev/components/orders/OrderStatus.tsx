import { Badge } from '@/components/ui/badge';

interface OrderStatusProps {
  status: string;
}

export const OrderStatus = ({ status }: OrderStatusProps) => {
  const getStatusVariant = () => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getStatusVariant()}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
