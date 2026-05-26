import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export function WebRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      
      // The new package name is com.tunzaa.app
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.tunzaa.app';
      const appStoreUrl = 'https://apps.apple.com/us/app/tunzaa/id123456789'; // Placeholder
      
      // Fallback redirect after a short delay
      setTimeout(() => {
        if (isIOS) {
          window.location.replace(appStoreUrl);
        } else {
          window.location.replace(playStoreUrl);
        }
      }, 1500);
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
      <View style={{ 
        width: 80, 
        height: 80, 
        backgroundColor: '#425BA4', 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 20
      }}>
        <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>T</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
        Opening Tunzaa...
      </Text>
      <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 24, textAlign: 'center', paddingHorizontal: 20 }}>
        You are being redirected to the app store to view this content in the Tunzaa app.
      </Text>
      <ActivityIndicator size="large" color="#425BA4" />
    </View>
  );
}
