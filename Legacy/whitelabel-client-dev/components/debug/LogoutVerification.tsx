import React, { useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { useSimplifiedCart } from '@/stores/cart-simplified';
import { useAuthStore } from '@/stores/auth';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * LogoutVerification Component
 * 
 * This is a DEBUG component to verify that logout properly clears all data.
 * 
 * Usage:
 * 1. Import this component in a test/debug screen
 * 2. Login and add items to cart/wishlist
 * 3. Check "Before Logout" state
 * 4. Click logout
 * 5. Check "After Logout" state
 * 
 * IMPORTANT: Remove this component from production builds!
 */

interface DataState {
  user: boolean;
  wishlistItems: number;
  cartItems: number;
  authStoreData: any;
  queryCache: number;
  asyncStorageKeys: string[];
  secureStoreKeys: string[];
}

export const LogoutVerification: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [beforeState, setBeforeState] = useState<DataState | null>(null);
  const [afterState, setAfterState] = useState<DataState | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const captureState = async (): Promise<DataState> => {
    const wishlistItems = useWishlistStore.getState().items.length;
    const cartItems = useSimplifiedCart.getState().items.length;
    const authStoreData = useAuthStore.getState();
    const queryCache = queryClient.getQueryCache().getAll().length;

    // Check AsyncStorage
    let asyncStorageKeys: string[] = [];
    try {
      const keys = await AsyncStorage.getAllKeys();
      asyncStorageKeys = keys.filter(key => 
        key.includes('user') || 
        key.includes('cart') || 
        key.includes('wishlist') ||
        key.includes('auth')
      );
    } catch (e) {
      console.error('Failed to get AsyncStorage keys:', e);
    }

    // Check SecureStore (mobile only)
    let secureStoreKeys: string[] = [];
    if (Platform.OS !== 'web') {
      try {
        // Note: SecureStore doesn't have a way to list all keys
        // We'll check specific known keys
        const knownKeys = ['user', 'access_token', 'refresh_token'];
        for (const key of knownKeys) {
          const value = await SecureStore.getItemAsync(key);
          if (value) {
            secureStoreKeys.push(key);
          }
        }
      } catch (e) {
        console.error('Failed to check SecureStore:', e);
      }
    }

    return {
      user: !!user,
      wishlistItems,
      cartItems,
      authStoreData,
      queryCache,
      asyncStorageKeys,
      secureStoreKeys,
    };
  };

  const handleCheckBefore = async () => {
    setIsChecking(true);
    const state = await captureState();
    setBeforeState(state);
    setIsChecking(false);
  };

  const handleLogout = async () => {
    setIsChecking(true);
    await logout();
    // Wait a bit for all cleanup to complete
    setTimeout(async () => {
      const state = await captureState();
      setAfterState(state);
      setIsChecking(false);
    }, 1000);
  };

  const handleCheckAfter = async () => {
    setIsChecking(true);
    const state = await captureState();
    setAfterState(state);
    setIsChecking(false);
  };

  const renderState = (state: DataState | null, title: string) => {
    if (!state) return null;

    const issues: string[] = [];
    if (state.user) issues.push('User object still exists');
    if (state.wishlistItems > 0) issues.push(`${state.wishlistItems} wishlist items remain`);
    if (state.cartItems > 0) issues.push(`${state.cartItems} cart items remain`);
    if (state.authStoreData.registrationPhone) issues.push('Auth store data remains');
    if (state.queryCache > 0) issues.push(`${state.queryCache} queries in cache`);
    if (state.asyncStorageKeys.length > 0) issues.push(`${state.asyncStorageKeys.length} AsyncStorage keys`);
    if (state.secureStoreKeys.length > 0) issues.push(`${state.secureStoreKeys.length} SecureStore keys`);

    const isPassed = issues.length === 0;

    return (
      <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: isPassed ? '#d4edda' : '#f8d7da' }}>
        <Text className="text-lg font-bold mb-2">{title}</Text>
        
        <View className="mb-2">
          <Text className="font-semibold">User Logged In:</Text>
          <Text className={state.user ? 'text-red-600' : 'text-green-600'}>
            {state.user ? '❌ Yes' : '✅ No'}
          </Text>
        </View>

        <View className="mb-2">
          <Text className="font-semibold">Wishlist Items:</Text>
          <Text className={state.wishlistItems > 0 ? 'text-red-600' : 'text-green-600'}>
            {state.wishlistItems > 0 ? `❌ ${state.wishlistItems}` : '✅ 0'}
          </Text>
        </View>

        <View className="mb-2">
          <Text className="font-semibold">Cart Items:</Text>
          <Text className={state.cartItems > 0 ? 'text-red-600' : 'text-green-600'}>
            {state.cartItems > 0 ? `❌ ${state.cartItems}` : '✅ 0'}
          </Text>
        </View>

        <View className="mb-2">
          <Text className="font-semibold">React Query Cache:</Text>
          <Text className={state.queryCache > 0 ? 'text-red-600' : 'text-green-600'}>
            {state.queryCache > 0 ? `❌ ${state.queryCache} queries` : '✅ Empty'}
          </Text>
        </View>

        <View className="mb-2">
          <Text className="font-semibold">AsyncStorage Keys:</Text>
          <Text className={state.asyncStorageKeys.length > 0 ? 'text-red-600' : 'text-green-600'}>
            {state.asyncStorageKeys.length > 0 ? `❌ ${state.asyncStorageKeys.length}` : '✅ 0'}
          </Text>
          {state.asyncStorageKeys.length > 0 && (
            <Text className="text-xs mt-1">{state.asyncStorageKeys.join(', ')}</Text>
          )}
        </View>

        {Platform.OS !== 'web' && (
          <View className="mb-2">
            <Text className="font-semibold">SecureStore Keys:</Text>
            <Text className={state.secureStoreKeys.length > 0 ? 'text-red-600' : 'text-green-600'}>
              {state.secureStoreKeys.length > 0 ? `❌ ${state.secureStoreKeys.length}` : '✅ 0'}
            </Text>
            {state.secureStoreKeys.length > 0 && (
              <Text className="text-xs mt-1">{state.secureStoreKeys.join(', ')}</Text>
            )}
          </View>
        )}

        <View className="mt-4 pt-4 border-t border-gray-300">
          <Text className="font-bold text-lg">
            {isPassed ? '✅ PASSED - All data cleared!' : '❌ FAILED - Data remains'}
          </Text>
          {!isPassed && (
            <View className="mt-2">
              <Text className="font-semibold mb-1">Issues:</Text>
              {issues.map((issue, idx) => (
                <Text key={idx} className="text-sm text-red-600">• {issue}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold mb-2">🧪 Logout Verification Tool</Text>
        <Text className="text-sm text-gray-600 mb-4">
          This tool helps verify that logout properly clears all user data.
          {'\n\n'}
          1. Check "Before Logout" state{'\n'}
          2. Click "Logout & Check"{'\n'}
          3. Verify "After Logout" shows no data
        </Text>
      </View>

      <View className="mb-4">
        <Button 
          onPress={handleCheckBefore} 
          disabled={isChecking}
          className="mb-2"
        >
          <Text>📸 Capture Before State</Text>
        </Button>

        <Button 
          onPress={handleLogout} 
          disabled={isChecking || !user}
          variant="destructive"
          className="mb-2"
        >
          <Text>🚪 Logout & Check After</Text>
        </Button>

        <Button 
          onPress={handleCheckAfter} 
          disabled={isChecking}
          variant="secondary"
        >
          <Text>📸 Capture After State</Text>
        </Button>
      </View>

      {isChecking && (
        <View className="mb-4 p-4 bg-blue-100 rounded-lg">
          <Text className="text-center">Checking state...</Text>
        </View>
      )}

      {beforeState && renderState(beforeState, '📸 Before Logout')}
      {afterState && renderState(afterState, '📸 After Logout')}

      {beforeState && afterState && (
        <View className="mt-4 p-4 bg-gray-100 rounded-lg">
          <Text className="font-bold mb-2">📊 Comparison</Text>
          <Text>User: {beforeState.user ? '✓' : '✗'} → {afterState.user ? '❌ Still exists' : '✅ Cleared'}</Text>
          <Text>Wishlist: {beforeState.wishlistItems} → {afterState.wishlistItems}</Text>
          <Text>Cart: {beforeState.cartItems} → {afterState.cartItems}</Text>
          <Text>Query Cache: {beforeState.queryCache} → {afterState.queryCache}</Text>
          <Text>Storage Keys: {beforeState.asyncStorageKeys.length} → {afterState.asyncStorageKeys.length}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default LogoutVerification;

