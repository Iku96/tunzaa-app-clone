import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useApiError } from '@/hooks/useApiError';

// Mock Firebase login error
const mockFirebaseLoginError = async () => {
  const error = {
    response: {
      status: 409,
      data: { code: 'USER_ALREADY_EXISTS' }
    },
    config: {
      url: 'https://api.example.com/auth/firebase/login',
      method: 'POST'
    }
  };
  throw error;
};

// Mock other Firebase login errors
const mockFirebaseErrors = {
  invalidToken: async () => {
    const error = {
      response: {
        status: 400,
        data: { code: 'INVALID_TOKEN' }
      },
      config: {
        url: 'https://api.example.com/auth/firebase/login',
        method: 'POST'
      }
    };
    throw error;
  },

  unauthorized: async () => {
    const error = {
      response: {
        status: 401,
        data: { code: 'UNAUTHORIZED' }
      },
      config: {
        url: 'https://api.example.com/auth/firebase/login',
        method: 'POST'
      }
    };
    throw error;
  },

  validationError: async () => {
    const error = {
      response: {
        status: 422,
        data: { code: 'VALIDATION_ERROR' }
      },
      config: {
        url: 'https://api.example.com/auth/firebase/login',
        method: 'POST'
      }
    };
    throw error;
  },

  serverError: async () => {
    const error = {
      response: {
        status: 500,
        data: { code: 'SERVER_ERROR' }
      },
      config: {
        url: 'https://api.example.com/auth/firebase/login',
        method: 'POST'
      }
    };
    throw error;
  }
};

export const FirebaseLoginErrorTest: React.FC = () => {
  const { 
    getErrorMessage, 
    getErrorAction, 
    isAuthError, 
    isValidationError,
    isRetryableError 
  } = useApiError();

  const testFirebaseError = async (apiCall: () => Promise<any>, testName: string) => {
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
        Firebase Login Error Test
      </Text>

      <Button
        title="Test User Already Exists (409)"
        onPress={() => testFirebaseError(mockFirebaseLoginError, 'User Already Exists')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Invalid Token (400)"
        onPress={() => testFirebaseError(mockFirebaseErrors.invalidToken, 'Invalid Token')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Unauthorized (401)"
        onPress={() => testFirebaseError(mockFirebaseErrors.unauthorized, 'Unauthorized')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Validation Error (422)"
        onPress={() => testFirebaseError(mockFirebaseErrors.validationError, 'Validation Error')}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Test Server Error (500)"
        onPress={() => testFirebaseError(mockFirebaseErrors.serverError, 'Server Error')}
      />

      <View style={{ height: 20 }} />

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Expected Results:
      </Text>

      <Text style={{ marginBottom: 5 }}>
        • User Already Exists (409): "An account with this email already exists"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Invalid Token (400): "Invalid authentication token"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Unauthorized (401): "Authentication failed"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Validation Error (422): "Please check your authentication information"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Server Error (500): "Authentication service temporarily unavailable"
      </Text>
    </View>
  );
}; 