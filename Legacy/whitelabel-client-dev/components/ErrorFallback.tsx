import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView
} from 'react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useRouter } from "expo-router";


type ErrorBoundaryProps = {
  error: Error;
  reset: () => void;
};

export function ErrorFallback({ error, reset }: ErrorBoundaryProps) {

  const router = useRouter()

  return (
    <SafeAreaView style={styles.overlayContainer}>
      <View style={styles.dialog}>
        {/* Optional: your logo */}

        <Text className="text-xl font-bold text-white">Something went wrong</Text>
        <Text className='text-base text-white text-center pt-4 pb-4'>
          An unexpected error occurred. Please try again.
          {/* {error?.message ?? 'An unexpected error occurred. Please try again.'} */}
        </Text>

        <Button variant="primary" className="w-full" onPress={() => {
          router.replace("/");
        }}>
          <Text className="text-sm font-bold">Okay</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1a1a1a', // dark modal background
    borderRadius: 12,
    padding: 24,
    alignItems: 'center'
  },
  logo: {
    // Example styling for logo/text brand
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: 'bold'
  },
  heading: {
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '600'
  },
  message: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 24
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500'
  }
});
