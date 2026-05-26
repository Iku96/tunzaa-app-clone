import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { typography } from '@/styles/theme/typography';

/**
 * Demonstration component showing the enhanced Inter Tight text implementation
 * This shows how Tailwind classes are automatically mapped to Inter Tight fonts
 */
export function InterTightTextDemo() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text className="text-3xl font-bold text-center mb-6">
          Inter Tight Font Demo
        </Text>
        
        <View style={styles.demoSection}>
          <Text className="text-xl font-semibold mb-4">
            Tailwind Font Weight Classes
          </Text>
          
          <Text className="font-thin mb-2">
            font-thin: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-extralight mb-2">
            font-extralight: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-light mb-2">
            font-light: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-normal mb-2">
            font-normal: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-medium mb-2">
            font-medium: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-semibold mb-2">
            font-semibold: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-bold mb-2">
            font-bold: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-extrabold mb-2">
            font-extrabold: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-black mb-2">
            font-black: The quick brown fox jumps over the lazy dog
          </Text>
        </View>
        
        <View style={styles.demoSection}>
          <Text className="text-xl font-semibold mb-4">
            Italic Variants
          </Text>
          
          <Text className="font-thin italic mb-2">
            font-thin italic: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-light italic mb-2">
            font-light italic: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-normal italic mb-2">
            font-normal italic: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-medium italic mb-2">
            font-medium italic: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-semibold italic mb-2">
            font-semibold italic: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-bold italic mb-2">
            font-bold italic: The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className="font-black italic mb-2">
            font-black italic: The quick brown fox jumps over the lazy dog
          </Text>
        </View>
        
        <View style={styles.demoSection}>
          <Text className="text-xl font-semibold mb-4">
            Direct Style Usage
          </Text>
          
          <Text style={{ fontFamily: typography.fontFamily.thin }}>
            Direct typography.fontFamily.thin
          </Text>
          
          <Text style={{ fontFamily: typography.fontFamily.semiBold }}>
            Direct typography.fontFamily.semiBold
          </Text>
          
          <Text style={{ fontFamily: typography.fontFamily.boldItalic }}>
            Direct typography.fontFamily.boldItalic
          </Text>
        </View>
        
        <View style={styles.demoSection}>
          <Text className="text-xl font-semibold mb-4">
            Size and Weight Combinations
          </Text>
          
          <Text className="text-xs font-light mb-2">
            Extra Small Light (12px)
          </Text>
          
          <Text className="text-sm font-normal mb-2">
            Small Normal (14px)
          </Text>
          
          <Text className="text-base font-medium mb-2">
            Base Medium (16px)
          </Text>
          
          <Text className="text-lg font-semibold mb-2">
            Large Semi Bold (18px)
          </Text>
          
          <Text className="text-xl font-bold mb-2">
            Extra Large Bold (20px)
          </Text>
          
          <Text className="text-2xl font-black mb-2">
            2X Large Black (24px)
          </Text>
        </View>
        
        <View style={styles.demoSection}>
          <Text className="text-xl font-semibold mb-4">
            Color Combinations
          </Text>
          
          <Text className="font-semibold text-primary mb-2">
            Primary Color Semi Bold
          </Text>
          
          <Text className="font-medium text-secondary mb-2">
            Secondary Color Medium
          </Text>
          
          <Text className="font-bold text-accent mb-2">
            Accent Color Bold
          </Text>
          
          <Text className="font-light text-muted-foreground mb-2">
            Muted Foreground Light
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
  },
  demoSection: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});

export default InterTightTextDemo; 