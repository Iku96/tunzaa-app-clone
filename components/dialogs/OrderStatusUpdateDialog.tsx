import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderStatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  onConfirm: () => void;
  isLoading?: boolean;
  loadingText?: string;
}

export const OrderStatusUpdateDialog = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmVariant = "default",
  onConfirm,
  isLoading = false,
  loadingText = "Processing...",
}: OrderStatusUpdateDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant={confirmVariant}
            onPress={onConfirm}
            disabled={isLoading}
          >
            <Text className="text-white">
              {isLoading ? loadingText : confirmText}
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
