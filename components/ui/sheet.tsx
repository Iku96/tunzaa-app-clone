import { View } from 'react-native';
import { Modal } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContentProps {
  side?: 'bottom' | 'right';
  className?: string;
  children: React.ReactNode;
}

interface SheetHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface SheetTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => onOpenChange(false)}
    >
      {children}
    </Modal>
  );
};

export const SheetContent = ({ side = 'bottom', className, children }: SheetContentProps) => {
  return (
    <View className="flex-1 bg-black/50 justify-end">
      <View
        className={cn(
          'bg-background rounded-t-[10px] p-4',
          side === 'right' ? 'h-full w-[80%] ml-auto' : '',
          className
        )}
      >
        {children}
      </View>
    </View>
  );
};

export const SheetHeader = ({ className, children }: SheetHeaderProps) => {
  return (
    <View className={cn('pb-4 border-b border-border', className)}>
      {children}
    </View>
  );
};

export const SheetTitle = ({ className, children }: SheetTitleProps) => {
  return (
    <Text className={cn('text-lg font-semibold text-foreground', className)}>
      {children}
    </Text>
  );
};
