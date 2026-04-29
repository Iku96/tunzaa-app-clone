import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useActivitiesStore } from '../stores/activities';

export const useTimeTracker = () => {
  const addTime = useActivitiesStore((state) => state.addTime);
  const startTimeRef = useRef<number>(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/active/) &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        // App moving to background - calculate elapsed time
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed > 0) {
          addTime(elapsed);
        }
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App moving to foreground - reset start time
        startTimeRef.current = Date.now();
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Also track time periodically (every minute) while active to avoid losing data if app crashes
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed >= 60) {
          addTime(elapsed);
          startTimeRef.current = Date.now();
        }
      }
    }, 60000);

    return () => {
      subscription.remove();
      clearInterval(interval);
      
      // Final save on unmount if active
      if (AppState.currentState === 'active') {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed > 0) {
          addTime(elapsed);
        }
      }
    };
  }, [addTime]);
};
