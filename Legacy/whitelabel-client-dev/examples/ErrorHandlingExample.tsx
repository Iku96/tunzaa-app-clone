import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useAddToWishlist, useRemoveFromWishlist } from '@/services/wishlist';
import { useMutationError } from '@/hooks/useApiError';

export const ErrorHandlingExample: React.FC = () => {
  const [productId, setProductId] = useState('example-product-123');

  // Using the new error handling hook
  const { handleMutationError, getErrorMessage, getErrorAction } = useMutationError({
    onAuthError: () => {
      Alert.alert(
        'Authentication Required',
        'Please log in to continue',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => console.log('Navigate to login') }
        ]
      );
    },
    onValidationError: (error) => {
      Alert.alert(
        'Validation Error',
        `${error.message}\n\nSuggested action: ${error.action}`,
        [{ text: 'OK' }]
      );
    },
    showToast: true,
  });

  // Example mutation with error handling
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const handleAddToWishlist = async () => {
    try {
      await addToWishlistMutation.mutateAsync({
        product_id: productId,
        variant_sku: 'example-variant',
      });
      Alert.alert('Success', 'Item added to wishlist!');
    } catch (error: any) {
      // The error is already parsed with user-friendly message
      const message = getErrorMessage(error);
      const action = getErrorAction(error);
      
      Alert.alert(
        'Error',
        `${message}${action ? `\n\nSuggested action: ${action}` : ''}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleRemoveFromWishlist = async () => {
    try {
      await removeFromWishlistMutation.mutateAsync({
        productId,
        variantSku: 'example-variant',
      });
      Alert.alert('Success', 'Item removed from wishlist!');
    } catch (error: any) {
      // Using the mutation error handler
      handleMutationError(error);
    }
  };

  const handleAddInvalidProduct = async () => {
    try {
      await addToWishlistMutation.mutateAsync({
        product_id: 'invalid-product-id',
        variant_sku: 'invalid-variant',
      });
    } catch (error: any) {
      // This will show a user-friendly error message based on the API response
      const message = getErrorMessage(error);
      Alert.alert('Error', message, [{ text: 'OK' }]);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Error Handling Example
      </Text>

      <Button
        title="Add to Wishlist (Valid)"
        onPress={handleAddToWishlist}
        disabled={addToWishlistMutation.isPending}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Remove from Wishlist"
        onPress={handleRemoveFromWishlist}
        disabled={removeFromWishlistMutation.isPending}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Add Invalid Product (Test Error)"
        onPress={handleAddInvalidProduct}
        disabled={addToWishlistMutation.isPending}
      />

      <View style={{ height: 20 }} />

      {addToWishlistMutation.isError && (
        <View style={{ backgroundColor: '#ffebee', padding: 10, borderRadius: 5 }}>
          <Text style={{ color: '#c62828', fontWeight: 'bold' }}>
            Error: {getErrorMessage(addToWishlistMutation.error)}
          </Text>
          {getErrorAction(addToWishlistMutation.error) && (
            <Text style={{ color: '#c62828', marginTop: 5 }}>
              Action: {getErrorAction(addToWishlistMutation.error)}
            </Text>
          )}
        </View>
      )}

      {addToWishlistMutation.isPending && (
        <Text style={{ color: '#1976d2' }}>Adding to wishlist...</Text>
      )}

      {addToWishlistMutation.isSuccess && (
        <Text style={{ color: '#388e3c' }}>Successfully added to wishlist!</Text>
      )}
    </View>
  );
};

// Example of using the error handling in a form component
export const FormErrorHandlingExample: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { handleMutationError, getErrorMessage, isValidationError } = useMutationError({
    onValidationError: (error) => {
      // Handle validation errors specifically
      Alert.alert(
        'Please check your input',
        error.message,
        [{ text: 'OK' }]
      );
    },
  });

  const handleSubmit = async () => {
    try {
      // Example API call that might fail
      // await loginApi.login(formData);
      throw new Error('Example error');
    } catch (error: any) {
      if (isValidationError(error)) {
        // Validation errors are handled by the hook
        handleMutationError(error);
      } else {
        // Other errors
        Alert.alert('Error', getErrorMessage(error));
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Form Error Handling
      </Text>

      <Button title="Submit Form (Test Error)" onPress={handleSubmit} />
    </View>
  );
}; 