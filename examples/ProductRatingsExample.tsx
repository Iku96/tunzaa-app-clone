import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import {
  useGetRatingSummary,
  useGetEntityReviews,
  useGetUserRating,
  useCreateRating,
  useUpdateRating,
  useDeleteRating,
  formatRating,
  getRatingColor,
  getStarDistributionPercentages,
  ratingsApi,
} from '../src/services/ratings';
import { Rating, RatingsSummary } from '../src/services/types/ratings';
import { useAuth } from '../context/auth';

interface ProductRatingsExampleProps {
  productId: string;
}

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 24 
}) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const filled = starValue <= rating;
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => !readonly && onRatingChange?.(starValue)}
        disabled={readonly}
        style={{ marginHorizontal: 2 }}
      >
        <Text 
          style={{ 
            fontSize: size, 
            color: filled ? '#FFD700' : '#E5E5E5',
            fontWeight: 'bold'
          }}
        >
          ★
        </Text>
      </TouchableOpacity>
    );
  });

  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
};

const ProductRatingsExample: React.FC<ProductRatingsExampleProps> = ({ productId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useAuth();

  // Fetch data using React Query hooks
  const { data: summary, isLoading: summaryLoading } = useGetRatingSummary(productId);
  const { data: reviews, isLoading: reviewsLoading } = useGetEntityReviews(productId, {
    status: 'approved',
    limit: 10,
    sort_by: 'created_at',
    sort_direction: -1
  });
  const { data: userRating } = useGetUserRating(productId, user?.user_id || '', !!user?.user_id);

  // Mutations
  const createRatingMutation = useCreateRating();
  const updateRatingMutation = useUpdateRating();
  const deleteRatingMutation = useDeleteRating();

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    try {
      if (isEditing && userRating) {
        await updateRatingMutation.mutateAsync({
          ratingId: userRating.rating_id,
          data: {
            score: newRating,
            content: reviewText
          }
        });
        Alert.alert('Success', 'Your review has been updated');
      } else {
        if (!user?.user_id) {
          Alert.alert('Error', 'You must be logged in to submit a review.');
          return;
        }

        await createRatingMutation.mutateAsync({
          entity_id: productId,
          entity_type: 'product',
          user_id: user.user_id,
          score: newRating,
          content: reviewText
        });
        Alert.alert('Success', 'Thank you for your review!');
      }
      
      setShowReviewForm(false);
      setReviewText('');
      setNewRating(5);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const handleEditReview = () => {
    if (userRating) {
      setNewRating(userRating.score);
      setReviewText(userRating.content);
      setIsEditing(true);
      setShowReviewForm(true);
    }
  };

  const handleDeleteReview = () => {
    if (userRating) {
      Alert.alert(
        'Delete Review',
        'Are you sure you want to delete your review?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteRatingMutation.mutateAsync({
                  ratingId: userRating.rating_id,
                  entityId: productId
                });
                Alert.alert('Success', 'Your review has been deleted');
              } catch (error) {
                Alert.alert('Error', 'Failed to delete review');
              }
            }
          }
        ]
      );
    }
  };

  const renderReviewItem = ({ item }: { item: Rating }) => (
    <View style={{ 
      padding: 16, 
      borderBottomWidth: 1, 
      borderBottomColor: '#E5E5E5',
      backgroundColor: '#FFFFFF'
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StarRating rating={item.score} readonly size={16} />
        <Text style={{ fontSize: 12, color: '#666' }}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={{ 
        marginTop: 8, 
        fontSize: 14, 
        lineHeight: 20, 
        color: '#333' 
      }}>
        {item.content}
      </Text>
      
      {item.is_verified_purchase && (
        <View style={{ 
          marginTop: 4, 
          paddingHorizontal: 8, 
          paddingVertical: 2, 
          backgroundColor: '#E8F5E8',
          borderRadius: 4,
          alignSelf: 'flex-start'
        }}>
          <Text style={{ fontSize: 10, color: '#22c55e', fontWeight: 'bold' }}>
            Verified Purchase
          </Text>
        </View>
      )}
    </View>
  );

  const renderRatingDistribution = () => {
    if (!summary) return null;
    
    const percentages = getStarDistributionPercentages(summary);
    
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Rating Distribution
        </Text>
        {Object.entries(percentages).reverse().map(([stars, percentage]) => (
          <View key={stars} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 4 
          }}>
            <Text style={{ width: 20, fontSize: 12 }}>{stars}★</Text>
            <View style={{ 
              flex: 1, 
              height: 8, 
              backgroundColor: '#E5E5E5', 
              borderRadius: 4,
              marginHorizontal: 8
            }}>
              <View style={{ 
                width: `${percentage}%`, 
                height: '100%', 
                backgroundColor: '#FFD700',
                borderRadius: 4
              }} />
            </View>
            <Text style={{ fontSize: 12, color: '#666' }}>{percentage}%</Text>
          </View>
        ))}
      </View>
    );
  };

  if (summaryLoading) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Loading ratings...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Rating Summary */}
      <View style={{ 
        backgroundColor: '#FFFFFF', 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E5E5' 
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
          Customer Reviews
        </Text>
        
        {summary ? (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ 
                fontSize: 32, 
                fontWeight: 'bold', 
                color: getRatingColor(summary.average_rating),
                marginRight: 8
              }}>
                {formatRating(summary.average_rating)}
              </Text>
              <View>
                <StarRating rating={summary.average_rating} readonly size={20} />
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {summary.total_ratings} reviews
                </Text>
              </View>
            </View>
            
            {renderRatingDistribution()}
          </View>
        ) : (
          <Text style={{ color: '#666' }}>No reviews yet</Text>
        )}
      </View>

      {/* User's Rating Section */}
      <View style={{ 
        backgroundColor: '#FFFFFF', 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E5E5' 
      }}>
        {userRating ? (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Your Review
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <StarRating rating={userRating.score} readonly size={16} />
              <Text style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                {new Date(userRating.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>
              {userRating.content}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                onPress={handleEditReview}
                style={{ 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  backgroundColor: '#007AFF',
                  borderRadius: 4
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDeleteReview}
                style={{ 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  backgroundColor: '#FF3B30',
                  borderRadius: 4
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setShowReviewForm(true)}
            style={{ 
              paddingHorizontal: 16, 
              paddingVertical: 12, 
              backgroundColor: '#007AFF',
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
              Write a Review
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Review Form */}
      {showReviewForm && (
        <View style={{ 
          backgroundColor: '#FFFFFF', 
          padding: 16, 
          borderBottomWidth: 1, 
          borderBottomColor: '#E5E5E5' 
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, marginBottom: 8 }}>Rating:</Text>
            <StarRating rating={newRating} onRatingChange={setNewRating} />
          </View>
          
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#E5E5E5',
              borderRadius: 8,
              padding: 12,
              height: 100,
              textAlignVertical: 'top'
            }}
            placeholder="Write your review here..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
          />
          
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity 
              onPress={handleSubmitReview}
              disabled={createRatingMutation.isPending || updateRatingMutation.isPending}
              style={{ 
                flex: 1,
                paddingVertical: 12, 
                backgroundColor: '#007AFF',
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                {createRatingMutation.isPending || updateRatingMutation.isPending 
                  ? 'Submitting...' 
                  : (isEditing ? 'Update Review' : 'Submit Review')
                }
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                setShowReviewForm(false);
                setReviewText('');
                setNewRating(5);
                setIsEditing(false);
              }}
              style={{ 
                flex: 1,
                paddingVertical: 12, 
                backgroundColor: '#8E8E93',
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reviews List */}
      <View style={{ flex: 1 }}>
        <View style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            Reviews ({reviews?.total || 0})
          </Text>
        </View>
        
        {reviewsLoading ? (
          <View style={{ padding: 16 }}>
            <Text>Loading reviews...</Text>
          </View>
        ) : (
          <FlatList
            data={reviews?.items || []}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.rating_id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#666' }}>No reviews yet</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default ProductRatingsExample;

// Usage example in a product details screen:
/*
import ProductRatingsExample from './ProductRatingsExample';

const ProductDetailsScreen = ({ route }) => {
  const { productId } = route.params;
  
  return (
    <View style={{ flex: 1 }}>
      // ... other product details
      <ProductRatingsExample productId={productId} />
    </View>
  );
};
*/

// Additional helper functions for other entity types:

// Store ratings component
export const StoreRatingsExample: React.FC<{ storeId: string }> = ({ storeId }) => {
  const { data: summary } = useGetRatingSummary(storeId);
  const { data: reviews } = useGetEntityReviews(storeId, { status: 'approved' });
  
  // Similar implementation but for store-specific ratings
  return <ProductRatingsExample productId={storeId} />;
};

// Delivery ratings component
export const DeliveryRatingsExample: React.FC<{ deliveryId: string }> = ({ deliveryId }) => {
  const { data: summary } = useGetRatingSummary(deliveryId);
  const { data: reviews } = useGetEntityReviews(deliveryId, { status: 'approved' });
  
  // Similar implementation but for delivery-specific ratings
  return <ProductRatingsExample productId={deliveryId} />;
};

// Quick usage examples:

// 1. Create a product rating
export const createProductReview = async (productId: string, userId: string, score: number, content: string) => {
  try {
    const rating = await ratingsApi.createRating({
      entity_id: productId,
      entity_type: 'product',
      user_id: userId,
      score,
      content
    });
  } catch (error) {
    console.error('Failed to create rating:', error);
  }
};

// 2. Get product rating summary
export const getProductRatingSummary = async (productId: string) => {
  try {
    const summary = await ratingsApi.getRatingSummary(productId);
  } catch (error) {
    console.error('Failed to get rating summary:', error);
  }
};

// 3. Get all reviews for a product
export const getProductReviews = async (productId: string) => {
  try {
    const reviews = await ratingsApi.getEntityReviews(productId, {
      status: 'approved',
      limit: 20
    });
  } catch (error) {
    console.error('Failed to get reviews:', error);
  }
}; 