import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/services/config';

/**
 * Hook to refresh React Query data when app comes to foreground
 * This ensures users always see fresh data when they return to the app
 */
export function useAppStateRefresh() {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // App came to foreground from background/inactive
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 [App State] App came to foreground - refreshing tenant config');
        
        try {
          // IMPORTANT: Clear AsyncStorage cache first, otherwise getTenant() will return cached data
          console.log('🗑️ [App State] Clearing AsyncStorage cache');
          await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_CONFIG);
          
          // Now invalidate React Query cache and trigger refetch
          // This will force a fresh API call since AsyncStorage cache is now cleared
          console.log('♻️ [App State] Invalidating React Query cache and refetching');
          await queryClient.invalidateQueries({ queryKey: ['tenant'] });
          
          console.log('✅ [App State] Tenant config refresh initiated');
        } catch (error) {
          console.error('❌ [App State] Error refreshing tenant config:', error);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [queryClient]);
}

