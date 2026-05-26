import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/context/auth";

const PushNotificationTest: React.FC = () => {
  const { user } = useAuth();
  const {
    hasPermission,
    canRequestPermission,
    blocked,
    loading,
    requestPermissions,
    currentToken,
    isSupported,
  } = usePushNotifications();

  const handleTestPermissions = async () => {

    if (!user) {
      Alert.alert("Error", "Please log in first");
      return;
    }

    if (!isSupported) {
      Alert.alert("Error", "Push notifications not supported on this platform");
      return;
    }

    try {
      const result = await requestPermissions();

      Alert.alert(
        "Permission Result",
        `Has Permission: ${result.hasPermission}\nCan Request: ${result.canRequestPermission}\nBlocked: ${result.blocked}`
      );
    } catch (error) {
      console.error("Permission error:", error);
      Alert.alert("Error", `Failed to request permissions: ${error}`);
    }
  };

  const showCurrentStatus = () => {
    const status = {
      "User Authenticated": !!user,
      "Platform Supported": isSupported,
      "Has Permission": hasPermission,
      "Can Request Permission": canRequestPermission,
      Blocked: blocked,
      Loading: loading,
      "Token Available": !!currentToken,
    };

    const statusText = Object.entries(status)
      .map(([key, value]) => `${key}: ${value ? "✅" : "❌"}`)
      .join("\n");

    Alert.alert("Push Notification Status", statusText);
  };

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Push Notification Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          User: {user ? "✅ Logged In" : "❌ Not Logged In"}
        </Text>
        <Text style={styles.statusText}>
          Supported: {isSupported ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={styles.statusText}>
          Permission: {hasPermission ? "✅ Granted" : "❌ Not Granted"}
        </Text>
        <Text style={styles.statusText}>
          Can Request: {canRequestPermission ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={styles.statusText}>
          Blocked: {blocked ? "❌ Yes" : "✅ No"}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={showCurrentStatus}>
        <Text style={styles.buttonText}>Show Full Status</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleTestPermissions}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Test Permissions"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        1. Make sure you're logged in{"\n"}
        2. Tap "Test Permissions"{"\n"}
        3. Check console logs for detailed debug info
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#007AFF",
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#666",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  instructions: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});

export default PushNotificationTest;
