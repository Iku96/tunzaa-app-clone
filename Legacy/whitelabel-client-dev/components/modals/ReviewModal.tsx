import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Star, Camera } from "lucide-react-native";
import { useReviewsStore } from "@/stores/reviews";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { useCreateRating } from "@/services/ratings";
import type { Order } from "@/stores/orders";

interface ReviewModalProps {
  order: Order;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "default" | "sm" | "lg";
  disabled?: boolean;
  canReview?: boolean;
}

export function ReviewModal({
  order,
  triggerText,
  triggerVariant = "default",
  triggerSize = "default",
  disabled = false,
  canReview = true,
}: ReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addReview = useReviewsStore((state) => state.addReview);
  const { user } = useAuth();
  const createRating = useCreateRating();

  const handleOpen = () => {
    if (canReview) {
      setRating(0);
      setComment("");
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    if (!user?.user_id) {
      Alert.alert('Error', 'You must be logged in to submit a rating.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create ratings for each product in the order using the ratings API
      const ratingPromises = order.items.map((item) =>
        createRating.mutateAsync({
          entity_id: String(item.productId),
          entity_type: 'product',
          user_id: String(user.user_id),
          score: rating,
          content: comment,
          metadata: {
            order_id: String(order.id),
            order_number: String(order.id), // Use order.id as order number if orderNumber doesn't exist
          },
        })
      );

      await Promise.all(ratingPromises);

      // Also add to local store for backwards compatibility
      order.items.forEach((item) => {
        addReview({
          orderId: order.id,
          productId: item.productId,
          rating,
          comment,
        });
      });

      Alert.alert(
        'Reviews Submitted',
        'Thank you for your feedback! Your reviews help other customers make informed decisions.'
      );
      
      handleClose();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit reviews. Please try again later.'
      );
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTrigger = () => {
    if (!canReview) return null;

    return (
      <TouchableOpacity
        className="flex-row items-center justify-center bg-primary p-4 rounded-xl gap-x-2"
        onPress={handleOpen}
        disabled={disabled}
      >
        <Star size={20} color="#FFFFFF" />
        <Text className="text-base font-semibold text-white">
          {triggerText || "Leave a Review"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => (
    <ScrollView className="flex-1">
      <View className="items-center mb-6">
        <Text className="text-lg font-semibold mb-4">
          How was your experience?
        </Text>
        <View className="flex-row gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              variant="ghost"
              size="icon"
              className="p-1"
              onPress={() => setRating(value)}
              disabled={isSubmitting}
            >
              <Star
                size={32}
                className={value <= rating ? "text-yellow-400" : "text-muted"}
                fill={value <= rating ? "currentColor" : "none"}
              />
            </Button>
          ))}
        </View>
        <Text className="text-sm text-muted-foreground">
          {rating === 0 ? "Tap to rate" : `${rating} out of 5`}
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-lg font-semibold">Share your thoughts</Text>
          <Input
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us what you liked or what we could improve..."
            multiline
            numberOfLines={4}
            className="min-h-[120px] py-2"
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <Button
          variant="secondary"
          onPress={() => {}}
          disabled={isSubmitting}
          className="w-full flex-row justify-center items-center gap-2"
        >
          <Camera className="h-5 w-5 text-muted-foreground" />
          <Text className="font-semibold text-muted-foreground">
            Add Photos
          </Text>
        </Button>
      </View>
    </ScrollView>
  );

  const renderFooter = () => (
    <View className="flex-row gap-3">
      <Button
        variant="secondary"
        onPress={handleClose}
        disabled={isSubmitting}
        className="flex-1"
      >
        <Text className="font-semibold text-muted-foreground">Cancel</Text>
      </Button>

      <Button
        disabled={rating === 0 || isSubmitting}
        onPress={handleSubmit}
        className="flex-1"
      >
        <Text className="text-white font-semibold">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Text>
      </Button>
    </View>
  );

  return (
    <>
      {renderTrigger()}

      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={handleClose}
        title="Rate Your Experience"
        snapPoints={["90%"]}
        footer={renderFooter()}
      >
        {renderContent()}
      </ResponsiveModal>
    </>
  );
}
