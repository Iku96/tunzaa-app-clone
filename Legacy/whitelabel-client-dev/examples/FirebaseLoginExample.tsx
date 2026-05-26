import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { socialAuth } from '@/services/social-auth';
import { useApiError } from '@/hooks/useApiError';

export const FirebaseLoginExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { getErrorMessage, getErrorAction, isAuthError } = useApiError();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await socialAuth.signInWithGoogle();
      if (result) {
        Alert.alert('Success', 'Successfully signed in with Google!');
      } else {
        Alert.alert('Cancelled', 'Sign in was cancelled');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      const message = getErrorMessage(error);
      const action = getErrorAction(error);
      
      // Handle specific error cases
      if (error.apiError?.code === 'USER_ALREADY_EXISTS') {
        Alert.alert(
          'Account Exists',
          `${message}\n\n${action}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => console.log('Navigate to sign in') }
          ]
        );
      } else if (isAuthError(error)) {
        Alert.alert(
          'Authentication Error',
          `${message}\n\n${action}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          `${message}\n\n${action || 'Please try again'}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await socialAuth.signInWithApple();
      if (result) {
        Alert.alert('Success', 'Successfully signed in with Apple!');
      } else {
        Alert.alert('Cancelled', 'Sign in was cancelled');
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      
      const message = getErrorMessage(error);
      const action = getErrorAction(error);
      
      // Handle specific error cases
      if (error.apiError?.code === 'USER_ALREADY_EXISTS') {
        Alert.alert(
          'Account Exists',
          `${message}\n\n${action}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => console.log('Navigate to sign in') }
          ]
        );
      } else if (isAuthError(error)) {
        Alert.alert(
          'Authentication Error',
          `${message}\n\n${action}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          `${message}\n\n${action || 'Please try again'}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Firebase Social Login
      </Text>

      <Button
        title="Sign in with Google"
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Sign in with Apple"
        onPress={handleAppleSignIn}
        disabled={isLoading}
      />

      {isLoading && (
        <Text style={{ marginTop: 10, color: '#1976d2' }}>
          Signing in...
        </Text>
      )}

      <View style={{ height: 20 }} />

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Error Handling Features:
      </Text>

      <Text style={{ marginBottom: 5 }}>
        • User-friendly error messages
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Suggested actions for users
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Specific handling for "User Already Exists"
      </Text>
      <Text style={{ marginBottom: 5 }}>
        • Authentication error detection
      </Text>
    </View>
  );
}; 