import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./button";
import { Text } from "./text";
import { ArrowLeft } from "lucide-react-native";

interface WebViewScreenProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function WebViewScreen({ url, title, onClose }: WebViewScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onPress={onClose}
          className="flex-row items-center"
        >
          <ArrowLeft size={20} />
          <Text className="ml-2">Back</Text>
        </Button>
        <Text className="text-lg font-semibold flex-1 text-center mr-12">
          {title}
        </Text>
      </View>

      {/* Content */}
      {Platform.OS === "web" ? (
        // Fallback for Web: use iframe
        <iframe
          src={url}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      ) : (
        // Native: use WebView
        <WebView
          style={styles.webview}
          source={{ uri: url }}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
