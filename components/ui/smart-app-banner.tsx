import React, { useEffect, useState } from 'react';
import { View, Text, Platform, TouchableOpacity, Image, Linking } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { useResolvedThemeColors } from '@/hooks/useThemeColors';

interface SmartAppBannerProps {
  appStoreUrl?: string;
  playStoreUrl?: string;
  appSchemeUrl?: string; // The deep link scheme (e.g. afrizon://)
}

export function SmartAppBanner({
  appStoreUrl = 'https://afrizon.africa', // Placeholder since not on App Store
  playStoreUrl = 'https://afrizon.africa', // Placeholder since not on Play Store
  appSchemeUrl,
}: SmartAppBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other');
  const resolvedThemeColors = useResolvedThemeColors();

  useEffect(() => {
    // Only show on Web and only on Mobile Devices
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);

      if (isIOS) {
        setOs('ios');
        setIsVisible(true);
      } else if (isAndroid) {
        setOs('android');
        setIsVisible(true);
      }
      
      // Optionally hide if they dismissed it before (using localStorage)
      const dismissed = localStorage.getItem('hideSmartBanner');
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('hideSmartBanner', 'true');
    }
  };

  const handleOpenApp = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // First try to open the app via the custom scheme if provided
      const currentPath = window.location.pathname + window.location.search;
      const deepLink = appSchemeUrl || `afrizon://${currentPath}`;
      
      // This is a common hack on the web to try opening an app, and fallback if it fails
      const start = Date.now();
      
      // Attempt to open native app
      window.location.href = deepLink;

      // Fallback timeout
      setTimeout(() => {
        // If the app didn't open, we will still be on the same page.
        // And if less than 2 seconds passed, it means it probably failed.
        if (Date.now() - start < 2000) {
          if (os === 'ios') {
            window.location.href = appStoreUrl;
          } else if (os === 'android') {
            window.location.href = playStoreUrl;
          }
        }
      }, 1500);
    }
  };

  if (!isVisible) return null;

  return (
    <View 
      className="w-full flex-row items-center justify-between p-3 bg-white border-b border-gray-200 z-50 sticky top-0"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <TouchableOpacity onPress={handleDismiss} className="mr-3 p-1">
        <X size={18} color="#666" />
      </TouchableOpacity>
      
      <View className="flex-1 flex-row items-center">
        {/* Placeholder Icon */}
        <View className="w-10 h-10 bg-primary rounded-lg items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">A</Text>
        </View>
        <View>
          <Text className="font-bold text-foreground">Afrizon</Text>
          <Text className="text-xs text-muted-foreground">View this in our App</Text>
        </View>
      </View>

      <Button size="sm" onPress={handleOpenApp}>
        <Text className="text-white font-semibold">Open</Text>
      </Button>
    </View>
  );
}
