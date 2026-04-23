import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { affiliatesApi } from '@/services/affiliates';
import { useAuth } from './auth';

// Types
interface ReferralState {
  referralCode: string | null;
  tenantId: string | null;
  affiliateId: string | null;
  productId: string | null;
  sessionId: string;
  isTracking: boolean;
  hasTrackedClick: boolean;
  sessionStartTime: number;
  error: string | null;
}

interface ReferralContextType {
  state: ReferralState;
  setReferralCode: (code: string, tenantId: string, productId?: string) => void;
  clearReferralCode: () => void;
  trackOrder: (orderId: string, amount: number) => Promise<void>;
  isReferralActive: () => boolean;
  getReferralInfo: () => { referralCode: string | null; tenantId: string | null; productId: string | null };
}

// Actions
type ReferralAction =
  | { type: 'SET_REFERRAL_CODE'; payload: { code: string; tenantId: string; productId?: string } }
  | { type: 'CLEAR_REFERRAL_CODE' }
  | { type: 'SET_TRACKING'; payload: boolean }
  | { type: 'SET_CLICK_TRACKED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'HYDRATE_STATE'; payload: Partial<ReferralState> };

// Storage keys
const STORAGE_KEYS = {
  REFERRAL_CODE: 'referral_code',
  TENANT_ID: 'referral_tenant_id',
  AFFILIATE_ID: 'referral_affiliate_id',
  PRODUCT_ID: 'referral_product_id',
  SESSION_ID: 'referral_session_id',
  SESSION_START_TIME: 'referral_session_start_time',
  HAS_TRACKED_CLICK: 'referral_has_tracked_click',
};

// Initial state
const initialState: ReferralState = {
  referralCode: null,
  tenantId: null,
  affiliateId: null,
  productId: null,
  sessionId: generateSessionId(),
  isTracking: false,
  hasTrackedClick: false,
  sessionStartTime: Date.now(),
  error: null,
};

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate a cookie-like ID for tracking
function generateCookieId(): string {
  return `cookie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Reducer
function referralReducer(state: ReferralState, action: ReferralAction): ReferralState {
  switch (action.type) {
    case 'SET_REFERRAL_CODE':
      return {
        ...state,
        referralCode: action.payload.code,
        tenantId: action.payload.tenantId,
        productId: action.payload.productId || null,
        sessionId: generateSessionId(),
        sessionStartTime: Date.now(),
        hasTrackedClick: false,
        error: null,
      };
    case 'CLEAR_REFERRAL_CODE':
      return {
        ...state,
        referralCode: null,
        tenantId: null,
        affiliateId: null,
        productId: null,
        hasTrackedClick: false,
        error: null,
      };
    case 'SET_TRACKING':
      return {
        ...state,
        isTracking: action.payload,
      };
    case 'SET_CLICK_TRACKED':
      return {
        ...state,
        hasTrackedClick: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'HYDRATE_STATE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

// Context
const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

// Provider
interface ReferralProviderProps {
  children: ReactNode;
}

export function ReferralProvider({ children }: ReferralProviderProps) {
  const [state, dispatch] = useReducer(referralReducer, initialState);
  const { user } = useAuth();

  // Load referral state from storage on mount
  useEffect(() => {
    loadReferralState();
  }, []);

  // Save referral state to storage whenever it changes
  useEffect(() => {
    saveReferralState();
  }, [state.referralCode, state.tenantId, state.affiliateId, state.productId, state.sessionId, state.sessionStartTime, state.hasTrackedClick]);

  // Load referral state from secure storage
  const loadReferralState = async () => {
    try {
      const [
        referralCode,
        tenantId,
        affiliateId,
        productId,
        sessionId,
        sessionStartTime,
        hasTrackedClick,
      ] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.REFERRAL_CODE),
        SecureStore.getItemAsync(STORAGE_KEYS.TENANT_ID),
        SecureStore.getItemAsync(STORAGE_KEYS.AFFILIATE_ID),
        SecureStore.getItemAsync(STORAGE_KEYS.PRODUCT_ID),
        SecureStore.getItemAsync(STORAGE_KEYS.SESSION_ID),
        SecureStore.getItemAsync(STORAGE_KEYS.SESSION_START_TIME),
        SecureStore.getItemAsync(STORAGE_KEYS.HAS_TRACKED_CLICK),
      ]);

      // Check if referral session is still valid (within 24 hours)
      const sessionStart = sessionStartTime ? parseInt(sessionStartTime) : Date.now();
      const sessionAge = Date.now() - sessionStart;
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > SESSION_TIMEOUT) {
        // Session expired, clear all referral data
        await clearStoredReferralData();
        return;
      }

      dispatch({
        type: 'HYDRATE_STATE',
        payload: {
          referralCode,
          tenantId,
          affiliateId,
          productId,
          sessionId: sessionId || generateSessionId(),
          sessionStartTime: sessionStart,
          hasTrackedClick: hasTrackedClick === 'true',
        },
      });
    } catch (error) {
      console.error('Error loading referral state:', error);
    }
  };

  // Save referral state to secure storage
  const saveReferralState = async () => {
    try {
      const operations = [
        state.referralCode
          ? SecureStore.setItemAsync(STORAGE_KEYS.REFERRAL_CODE, state.referralCode)
          : SecureStore.deleteItemAsync(STORAGE_KEYS.REFERRAL_CODE),
        state.tenantId
          ? SecureStore.setItemAsync(STORAGE_KEYS.TENANT_ID, state.tenantId)
          : SecureStore.deleteItemAsync(STORAGE_KEYS.TENANT_ID),
        state.affiliateId
          ? SecureStore.setItemAsync(STORAGE_KEYS.AFFILIATE_ID, state.affiliateId)
          : SecureStore.deleteItemAsync(STORAGE_KEYS.AFFILIATE_ID),
        state.productId
          ? SecureStore.setItemAsync(STORAGE_KEYS.PRODUCT_ID, state.productId)
          : SecureStore.deleteItemAsync(STORAGE_KEYS.PRODUCT_ID),
        SecureStore.setItemAsync(STORAGE_KEYS.SESSION_ID, state.sessionId),
        SecureStore.setItemAsync(STORAGE_KEYS.SESSION_START_TIME, state.sessionStartTime.toString()),
        SecureStore.setItemAsync(STORAGE_KEYS.HAS_TRACKED_CLICK, state.hasTrackedClick.toString()),
      ];

      await Promise.all(operations);
    } catch (error) {
      console.error('Error saving referral state:', error);
    }
  };

  // Clear stored referral data
  const clearStoredReferralData = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFERRAL_CODE),
        SecureStore.deleteItemAsync(STORAGE_KEYS.TENANT_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.AFFILIATE_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.PRODUCT_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_START_TIME),
        SecureStore.deleteItemAsync(STORAGE_KEYS.HAS_TRACKED_CLICK),
      ]);
    } catch (error) {
      console.error('Error clearing referral data:', error);
    }
  };

  // Set referral code
  const setReferralCode = (code: string, tenantId: string, productId?: string) => {
    dispatch({
      type: 'SET_REFERRAL_CODE',
      payload: { code, tenantId, productId },
    });

    // Track the click (fire and forget)
    trackClick(code).catch(error => {
      console.error('Error tracking referral click:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to track referral click' });
    });
  };

  // Clear referral code
  const clearReferralCode = () => {
    dispatch({ type: 'CLEAR_REFERRAL_CODE' });
    clearStoredReferralData();
  };

  // Track referral click
  const trackClick = async (code: string) => {
    if (state.hasTrackedClick) {
      return; // Already tracked click for this session
    }

    try {
      dispatch({ type: 'SET_TRACKING', payload: true });
      
      // Call the tracking API
      await affiliatesApi.trackReferralClick(code);
      
      dispatch({ type: 'SET_CLICK_TRACKED', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error tracking referral click:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_TRACKING', payload: false });
    }
  };

  // Track order
  const trackOrder = async (orderId: string, amount: number) => {
    if (!state.referralCode) {
      return; // No referral code to track
    }

    try {
      dispatch({ type: 'SET_TRACKING', payload: true });
      
      const cookieId = generateCookieId();
      
      await affiliatesApi.trackOrderEvent({
        order_id: orderId,
        amount,
        referral_code: state.referralCode,
        cookie_id: cookieId,
      });

      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Clear referral code after successful order tracking
      clearReferralCode();
    } catch (error) {
      console.error('Error tracking order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to track order' });
      throw error;
    } finally {
      dispatch({ type: 'SET_TRACKING', payload: false });
    }
  };

  // Check if referral is active
  const isReferralActive = () => {
    if (!state.referralCode) return false;
    
    // Check if session is still valid (within 24 hours)
    const sessionAge = Date.now() - state.sessionStartTime;
    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge < SESSION_TIMEOUT;
  };

  // Get referral info
  const getReferralInfo = () => ({
    referralCode: state.referralCode,
    tenantId: state.tenantId,
    productId: state.productId,
  });

  const contextValue: ReferralContextType = {
    state,
    setReferralCode,
    clearReferralCode,
    trackOrder,
    isReferralActive,
    getReferralInfo,
  };

  return (
    <ReferralContext.Provider value={contextValue}>
      {children}
    </ReferralContext.Provider>
  );
}

// Hook to use referral context
export function useReferral() {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}

// Hook to get referral info
export function useReferralInfo() {
  const { getReferralInfo, isReferralActive } = useReferral();
  
  return {
    ...getReferralInfo(),
    isActive: isReferralActive(),
  };
} 