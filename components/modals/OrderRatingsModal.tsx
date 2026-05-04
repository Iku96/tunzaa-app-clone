import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { X, Star, Package, Store, Truck, Camera } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  useCreateRating,
  useGetUserRating,
  useUpdateRating,
  createProductRating,
  createStoreRating,
  createDeliveryRating,
} from '@/src/services/ratings';
import { useAuth } from '@/context/auth';

interface OrderRatingsModalProps {
  visible: boolean;
  onClose: () => void;
  order: any;
  delivery: any;
  groupedItems: Record<string, { store_id: string; store_name: string; items: any[] }>;
}

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  size = 24,
  readonly = false 
}) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const filled = starValue <= rating;
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => !readonly && onRatingChange(starValue)}
        disabled={readonly}
        style={{ marginHorizontal: 2 }}
      >
        <Star
          size={size}
          color={filled ? '#FFD700' : '#E5E5E5'}
          fill={filled ? '#FFD700' : 'transparent'}
        />
      </TouchableOpacity>
    );
  });

  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
};

interface RatingItemProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  entityId: string;
  entityType: 'product' | 'store' | 'delivery';
  onRatingSubmit: (entityId: string, entityType: string, rating: number, review: string) => void;
  onRatingUpdate: (ratingId: string, rating: number, review: string) => void;
  existingRating?: any;
}

const RatingItem: React.FC<RatingItemProps> = ({
  title,
  subtitle,
  icon,
  entityId,
  entityType,
  onRatingSubmit,
  onRatingUpdate,
  existingRating
}) => {
  const [rating, setRating] = useState(existingRating?.score || 0);
  const [review, setReview] = useState(existingRating?.content || '');
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when existingRating changes
  React.useEffect(() => {
    if (existingRating) {
      setRating(existingRating.score);
      setReview(existingRating.content);
    }
  }, [existingRating]);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    if (review.trim() === '') {
      Alert.alert('Review Required', 'Please write a review before submitting.');
      return;
    }
    
    if (existingRating && isEditing) {
      onRatingUpdate(existingRating.rating_id, rating, review);
      setIsEditing(false);
    } else {
      onRatingSubmit(entityId, entityType, rating, review);
    }
    setExpanded(false);
  };

  const canEdit = existingRating && existingRating.status === 'pending';
  const isApproved = existingRating && existingRating.status === 'approved';
  const isRejected = existingRating && existingRating.status === 'rejected';

  return (
    <Card className="mb-4">
      <View className="p-4">
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            {icon}
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-foreground">
                {title}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {subtitle}
              </Text>
            </View>
          </View>
                     <View className="flex-row items-center">
             {existingRating ? (
               <View className="flex-row gap-2">
                 <Badge 
                   variant={isApproved ? "success" : isRejected ? "destructive" : "secondary"} 
                   className={
                     isApproved ? 'bg-green-500' : 
                     isRejected ? 'bg-red-500' : 'bg-yellow-500'
                   }
                 >
                   <Text className="text-white text-xs">
                     ★ {existingRating.score}
                   </Text>
                 </Badge>
                 <Badge variant="outline">
                   <Text className="text-xs">
                     {isApproved ? 'Approved' : 
                      isRejected ? 'Rejected' : 'Pending'}
                   </Text>
                 </Badge>
               </View>
             ) : rating > 0 ? (
               <Badge variant="primary">
                 <Text className="text-xs">★ {rating}</Text>
               </Badge>
             ) : (
               <Badge variant="outline">
                 <Text className="text-xs">Not rated</Text>
               </Badge>
             )}
           </View>
        </TouchableOpacity>

                 {expanded && (
           <View className="mt-4 pt-4 border-t border-border">
             <View className="mb-4">
               <Text className="text-sm font-medium text-foreground mb-2">
                 Rate this {entityType}:
               </Text>
               <StarRating
                 rating={rating}
                 onRatingChange={setRating}
                 size={32}
                 readonly={existingRating && !isEditing}
               />
             </View>

             <View className="mb-4">
               <Text className="text-sm font-medium text-foreground mb-2">
                 Write a review:
               </Text>
               <TextInput
                 className="border border-border rounded-lg p-3 text-foreground"
                 placeholder={`Tell others about your experience with this ${entityType}...`}
                 value={review}
                 onChangeText={setReview}
                 multiline
                 numberOfLines={4}
                 textAlignVertical="top"
                 editable={!existingRating || isEditing}
               />
             </View>

             {/* No existing rating - show submit form */}
             {!existingRating && (
               <View className="flex-row gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onPress={() => setExpanded(false)}
                   className="flex-1"
                 >
                   <Text>Cancel</Text>
                 </Button>
                 <Button
                   size="sm"
                   onPress={handleSubmit}
                   className="flex-1"
                 >
                   <Text>Submit Rating</Text>
                 </Button>
               </View>
             )}

             {/* Existing rating - show status and actions */}
             {existingRating && !isEditing && (
               <View className="gap-2">
                 <Text className="text-xs text-muted-foreground">
                   Rated on {new Date(existingRating.created_at).toLocaleDateString()}
                   {existingRating.updated_at !== existingRating.created_at && 
                     ` • Updated on ${new Date(existingRating.updated_at).toLocaleDateString()}`
                   }
                 </Text>
                 
                 {isApproved && (
                   <Text className="text-xs text-success">
                     ✓ Your rating has been approved and is now public
                   </Text>
                 )}
                 
                 {isRejected && (
                   <Text className="text-xs text-destructive">
                     ✗ Your rating was rejected and is not visible to others
                   </Text>
                 )}
                 
                 {canEdit && (
                   <View className="flex-row gap-2 mt-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onPress={() => setIsEditing(true)}
                       className="flex-1"
                     >
                       <Text>Edit Rating</Text>
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onPress={() => setExpanded(false)}
                       className="flex-1"
                     >
                       <Text>Close</Text>
                     </Button>
                   </View>
                 )}
               </View>
             )}

             {/* Editing existing rating */}
             {existingRating && isEditing && (
               <View className="flex-row gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onPress={() => {
                     setIsEditing(false);
                     // Reset to original values
                     setRating(existingRating.score);
                     setReview(existingRating.content);
                   }}
                   className="flex-1"
                 >
                   <Text>Cancel</Text>
                 </Button>
                 <Button
                   size="sm"
                   onPress={handleSubmit}
                   className="flex-1"
                 >
                   <Text>Update Rating</Text>
                 </Button>
               </View>
             )}
           </View>
         )}
      </View>
    </Card>
  );
};

export const OrderRatingsModal: React.FC<OrderRatingsModalProps> = ({
  visible,
  onClose,
  order,
  delivery,
  groupedItems,
}) => {
  const [submittingRatings, setSubmittingRatings] = useState(false);
  const [completedRatings, setCompletedRatings] = useState<Set<string>>(new Set());

  const { user } = useAuth();
  const createRating = useCreateRating();
  const updateRating = useUpdateRating();

  // Get all entity IDs to fetch existing ratings
  const allProductIds = Object.values(groupedItems).flatMap(store => 
    store.items.map(item => item.product_id)
  );
  const allStoreIds = Object.keys(groupedItems);
  const deliveryId = delivery?.id;

  // Fetch existing ratings for all entities
  const deliveryRatingQuery = useGetUserRating(deliveryId, user?.user_id || '', !!deliveryId && !!user?.user_id);
  const storeRatingQueries = allStoreIds.map(storeId => 
    useGetUserRating(storeId, user?.user_id || '', !!storeId && !!user?.user_id)
  );
  const productRatingQueries = allProductIds.map(productId => 
    useGetUserRating(productId, user?.user_id || '', !!productId && !!user?.user_id)
  );

  // Create maps for easy lookup
  const existingRatings = React.useMemo(() => {
    const ratings: Record<string, any> = {};
    
    // Add delivery rating
    if (deliveryRatingQuery.data) {
      ratings[deliveryId] = deliveryRatingQuery.data;
    }
    
    // Add store ratings
    storeRatingQueries.forEach((query, index) => {
      if (query.data) {
        ratings[allStoreIds[index]] = query.data;
      }
    });
    
    // Add product ratings
    productRatingQueries.forEach((query, index) => {
      if (query.data) {
        ratings[allProductIds[index]] = query.data;
      }
    });
    
    return ratings;
  }, [deliveryRatingQuery.data, storeRatingQueries, productRatingQueries, deliveryId, allStoreIds, allProductIds]);

  const handleRatingSubmit = async (
    entityId: string,
    entityType: string,
    rating: number,
    review: string
  ) => {
    try {
      setSubmittingRatings(true);
      
      if (!user?.user_id) {
        Alert.alert('Error', 'You must be logged in to submit a rating.');
        return;
      }

      await createRating.mutateAsync({
        entity_id: entityId,
        entity_type: entityType as any,
        user_id: user.user_id,
        score: rating,
        content: review,
        metadata: {
          order_id: order.order_id,
          order_number: order.order_number,
        },
      });

      setCompletedRatings(prev => new Set(prev).add(entityId));
      
      Alert.alert(
        'Rating Submitted',
        `Thank you for rating this ${entityType}! Your feedback helps improve our service.`
      );
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to submit rating for ${entityType}. Please try again.`
      );
      console.error('Rating submission error:', error);
    } finally {
      setSubmittingRatings(false);
    }
  };

  const handleRatingUpdate = async (
    ratingId: string,
    rating: number,
    review: string
  ) => {
    try {
      setSubmittingRatings(true);
      
      await updateRating.mutateAsync({
        ratingId,
        data: {
          score: rating,
          content: review,
        },
      });

      Alert.alert(
        'Rating Updated',
        'Your rating has been updated successfully!'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update rating. Please try again.'
      );
      console.error('Rating update error:', error);
    } finally {
      setSubmittingRatings(false);
    }
  };

  // Calculate progress including existing ratings
  const totalRatableItems = allProductIds.length + allStoreIds.length + (delivery ? 1 : 0);
  const existingRatingsCount = Object.keys(existingRatings).length;
  const completedCount = completedRatings.size + existingRatingsCount;
  const progressPercentage = Math.round((completedCount / totalRatableItems) * 100);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View>
            <Text className="text-xl font-bold text-foreground">
              Rate Your Experience
            </Text>
            <Text className="text-sm text-muted-foreground">
              Order #{order.order_number}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View className="p-4 bg-secondary">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-foreground">
              Progress: {completedCount} of {totalRatableItems} ratings
            </Text>
            <Text className="text-sm text-muted-foreground">
              {progressPercentage}%
            </Text>
          </View>
          <View className="h-2 bg-muted rounded-full">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Delivery Rating */}
          {delivery && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Delivery Experience
              </Text>
                             <RatingItem
                 title="Delivery Service"
                 subtitle="Rate the overall delivery experience"
                 icon={<Truck size={24} className="text-primary" />}
                 entityId={delivery.id}
                 entityType="delivery"
                 onRatingSubmit={handleRatingSubmit}
                 onRatingUpdate={handleRatingUpdate}
                 existingRating={existingRatings[delivery.id]}
               />
            </View>
          )}

          {/* Store Ratings */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Store Experience
            </Text>
            {Object.values(groupedItems).map((storeGroup) => (
                             <RatingItem
                 key={storeGroup.store_id}
                 title={storeGroup.store_name}
                 subtitle={`${storeGroup.items.length} item${storeGroup.items.length !== 1 ? 's' : ''} from this store`}
                 icon={<Store size={24} className="text-primary" />}
                 entityId={storeGroup.store_id}
                 entityType="store"
                 onRatingSubmit={handleRatingSubmit}
                 onRatingUpdate={handleRatingUpdate}
                 existingRating={existingRatings[storeGroup.store_id]}
               />
            ))}
          </View>

          {/* Product Ratings */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Product Reviews
            </Text>
            {Object.values(groupedItems).map((storeGroup) => (
              <View key={`products-${storeGroup.store_id}`} className="mb-4">
                <Text className="text-base font-medium text-foreground mb-3">
                  Products from {storeGroup.store_name}
                </Text>
                {storeGroup.items.map((item) => (
                                     <RatingItem
                     key={item.product_id}
                     title={item.name}
                     subtitle={`SKU: ${item.sku} • Qty: ${item.quantity}`}
                     icon={<Package size={24} className="text-primary" />}
                     entityId={item.product_id}
                     entityType="product"
                     onRatingSubmit={handleRatingSubmit}
                     onRatingUpdate={handleRatingUpdate}
                     existingRating={existingRatings[item.product_id]}
                   />
                ))}
              </View>
            ))}
          </View>

          {/* Instructions */}
          <Card className="mb-6">
            <View className="p-4">
              <Text className="text-base font-semibold text-foreground mb-2">
                Why Rate & Review?
              </Text>
              <Text className="text-sm text-muted-foreground">
                Your feedback helps other customers make informed decisions and helps businesses improve their services. All reviews are public and help build trust in our marketplace.
              </Text>
            </View>
          </Card>

          {/* Complete Button */}
          {completedCount === totalRatableItems && (
            <Button
              onPress={onClose}
              className="w-full mb-6"
              size="lg"
            >
              <Text className="font-semibold">
                All Done! Thank You for Your Feedback
              </Text>
            </Button>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View className="p-4 border-t border-border">
          <View className="flex-row gap-2 pb-4">
            <Button
              variant="outline"
              
              onPress={onClose}
              className="flex-1"
            >
              <Text>
                {completedCount > 0 ? 'Save & Continue Later' : 'Skip For Now'}
              </Text>
            </Button>
            {completedCount < totalRatableItems && (
              <Button
                variant="secondary"
                
                onPress={() => {
                  Alert.alert(
                    'Rating Reminder',
                    'We\'ll remind you to rate your experience later. Your feedback is valuable to us!'
                  );
                  onClose();
                }}
                className="flex-1"
              >
                <Text>Remind Me Later</Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default OrderRatingsModal; 