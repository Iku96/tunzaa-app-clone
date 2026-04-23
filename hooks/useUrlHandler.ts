import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { useReferral } from '@/context/referral';
import { extractReferralInfo } from '@/lib/linking';

export function useUrlHandler() {
  const router = useRouter();
  const segments = useSegments();
  const { setReferralCode, clearReferralCode, isReferralActive } = useReferral();
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  // Handle initial URL when app opens
  useEffect(() => {
    const handleInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          processUrl(initialUrl);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    handleInitialUrl();
  }, []);

  // Handle URL changes when app is already open
  useEffect(() => {
    const handleUrlChange = (event: { url: string }) => {
      processUrl(event.url);
    };

    const subscription = Linking.addEventListener('url', handleUrlChange);
    return () => subscription?.remove();
  }, []);

  // Process URL and extract referral information
  const processUrl = async (url: string) => {
    if (isProcessingUrl) return; // Prevent multiple processing
    
    setIsProcessingUrl(true);
    
    try {
      
      const referralInfo = extractReferralInfo(url);
      if (!referralInfo) {
        // console.log('No referral information found in URL');
        return;
      }
      
      // If there's a referral code, store it
      if (referralInfo.referralCode && referralInfo.tenantId) {
        setReferralCode(
          referralInfo.referralCode,
          referralInfo.tenantId,
          referralInfo.productId
        );
        
        
        // Navigate to the product page
        // Remove query parameters from the URL for cleaner navigation
        const cleanProductUrl = `/(buyer)/product/${referralInfo.productId}`;
        router.push(cleanProductUrl as any);
        
        // For public users, navigate to public product page
        if (segments.some(segment => segment === '(public)')) {
          router.push(`/(public)/product/${referralInfo.productId}` as any);
        }
      } else {
        // Clear referral code if URL doesn't contain one
        clearReferralCode();
      }
    } catch (error) {
      console.error('Error processing URL:', error);
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Extract URL parameters from current URL
  const getUrlParams = () => {
    const url = Linking.createURL('');
    return extractReferralInfo(url);
  };

  // Check if current session has active referral
  const hasActiveReferral = () => {
    return isReferralActive();
  };

  return {
    processUrl,
    getUrlParams,
    hasActiveReferral,
    isProcessingUrl,
  };
}

// Hook specifically for product pages to handle referral parameters
export function useProductReferral(productId: string) {
  const { setReferralCode, getReferralInfo, isReferralActive: checkReferralActive } = useReferral();
  const [hasProcessedReferral, setHasProcessedReferral] = useState(false);

  // Check for URL parameters when component mounts
  useEffect(() => {
    const checkForReferralParams = async () => {
      if (hasProcessedReferral) return;
      
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const referralInfo = extractReferralInfo(url);
          
          if (referralInfo?.referralCode && referralInfo?.tenantId) {
            // Only set referral code if we're on the correct product page
            if (referralInfo.productId === productId) {
              setReferralCode(
                referralInfo.referralCode,
                referralInfo.tenantId,
                referralInfo.productId
              );
              
            }
          }
        }
      } catch (error) {
        console.error('Error checking for referral params:', error);
      } finally {
        setHasProcessedReferral(true);
      }
    };

    checkForReferralParams();
  }, [productId, hasProcessedReferral, setReferralCode]);

  // Get current referral information
  const referralInfo = getReferralInfo();
  const isReferralActive = checkReferralActive();

  return {
    referralCode: referralInfo.referralCode,
    tenantId: referralInfo.tenantId,
    isReferralActive,
    isCurrentProductReferral: referralInfo.productId === productId,
  };
} 