import { ScrollView as RNScrollView, ScrollViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export function ScrollView({
  className,
  ...props
}: ScrollViewProps & { className?: string }) {
  return <RNScrollView className={cn('flex-1', className)} {...props} />;
}
