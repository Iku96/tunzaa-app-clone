import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useApiError } from '@/hooks/useApiError';

// Mock API calls to test error handling
const mockApiCalls = {
  // Simulate a 400 error with PRODUCT_INACTIVE code
  addToWishlist: async () => {
    const error = {
      response: {
        status: 400,
        data: { code: 'PRODUCT_INACTIVE' }
      },
      config: {
        url: 'https://api.example.com/v1/wishlist/items',
        method: 'POST'
      }
    };
    throw error;
  },

  // Simulate a 401 error
  unauthorized: async () => {
    const error = {
      response: {
        status: 401,
        data: { code: 'UNAUTHORIZED' }
      },
      config: {
        url: 'https://api.example.com/v1/wishlist',
        method: 'GET'
      }
    };
    throw error;
  },

  // Simulate a 404 error
  notFound: async () => {
    const error = {
      response: {
        status: 404,
        data: { code: 'PRODUCT_NOT_FOUND' }
      },
      config: {
        url: 'https://api.example.com/v1/products/123',
        method: 'GET'
      }
    };
    throw error;
  },

  // Simulate a 422 validation error
  validationError: async () => {
    const error = {
      response: {
        status: 422,
        data: { code: 'VALIDATION_ERROR' }
      },
      config: {
        url: 'https://api.example.com/v1/users',
        method: 'POST'
      }
    };
    throw error;
  },

  // Simulate a 500 server error
  serverError: async () => {
    const error = {
      response: {
        status: 500,
        data: { code: 'SERVER_ERROR' }
      },
      config: {
        url: 'https://api.example.com/v1/orders',
        method: 'POST'
      }
    };
    throw error;
  },

  // Simulate a generic error
  genericError: async () => {
    throw new Error('Something went wrong');
  }
};

export const ErrorHandlingTest: React.FC = () => {
  const { 
    getErrorMessage, 
    getErrorAction, 
    isAuthError, 
    isValidationError,
    isRetryableError 
  } = useApiError();

  const testError = async (apiCall: () => Promise<any>, testName: string) => {
    try {
      await apiCall();
    } catch (error: any) {
      const message = getErrorMessage(error);
      const action = getErrorAction(error);
      
      Alert.alert(
        testName,
        `Message: ${message}\n\nAction: ${action || 'None'}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Error Handling Test
      </Text>

      <Button
        title="Test Product Inactive Error"
        onPress={() => testError(mockApiCalls.addToWishlist, 'Product Inactive')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Unauthorized Error"
        onPress={() => testError(mockApiCalls.unauthorized, 'Unauthorized')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Not Found Error"
        onPress={() => testError(mockApiCalls.notFound, 'Not Found')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Validation Error"
        onPress={() => testError(mockApiCalls.validationError, 'Validation Error')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Server Error"
        onPress={() => testError(mockApiCalls.serverError, 'Server Error')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Generic Error"
        onPress={() => testError(mockApiCalls.genericError, 'Generic Error')}
      />

      <View style={{ height: 20 }} />

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Expected Results:
      </Text>

      <Text style={{ marginBottom: 5 }}>
        • Product Inactive: "This product is no longer available"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Unauthorized: "Please log in to view your wishlist"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Not Found: "Product not found"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Validation: "Please check your input and try again"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Server Error: "Something went wrong. Please try again"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Generic: "Something went wrong. Please try again"
      </Text>
    </View>
  );
}; 