import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/context/auth";

const PushNotificationDebug: React.FC = () => {
  const { user } = useAuth();
  const {
    hasPermission,
    canRequestPermission,
    blocked,
    loading,
    requestPermissions,
    currentToken,
    isSupported,
    refreshToken,
  } = usePushNotifications();

  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermissions();

      Alert.alert(
        "Permission Result",
        `Has Permission: ${result.hasPermission}\nCan Request: ${result.canRequestPermission}\nBlocked: ${result.blocked}`
      );
    } catch (error) {
      Alert.alert("Error", `Failed to request permissions: ${error}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRefreshToken = async () => {
    try {
      const token = await refreshToken();
      Alert.alert(
        "Token Refreshed",
        token ? `New token: ${token.substring(0, 20)}...` : "No token available"
      );
    } catch (error) {
      Alert.alert("Error", `Failed to refresh token: ${error}`);
    }
  };

  const copyTokenToClipboard = () => {
    if (currentToken) {
      // For debugging - in production, don't log tokens
      Alert.alert("Token Copied", "Token copied to console log");
    }
  };

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Push Notifications Debug</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.info}>
          User: {user ? "✅ Authenticated" : "❌ Not authenticated"}
        </Text>
        <Text style={styles.info}>
          Supported: {isSupported ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={styles.info}>
          Has Permission: {hasPermission ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={styles.info}>
          Can Request: {canRequestPermission ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={styles.info}>Blocked: {blocked ? "❌ Yes" : "✅ No"}</Text>
        <Text style={styles.info}>Loading: {loading ? "⏳ Yes" : "✅ No"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Token</Text>
        <Text style={styles.info}>
          Token: {currentToken ? "✅ Available" : "❌ Not available"}
        </Text>
        {currentToken && (
          <TouchableOpacity
            onPress={copyTokenToClipboard}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Copy Token to Console</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          onPress={handleRequestPermissions}
          disabled={isRequesting || loading || !user}
          style={[
            styles.button,
            (!user || isRequesting || loading) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {isRequesting ? "Requesting..." : "Request Permissions"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRefreshToken}
          disabled={!hasPermission || loading}
          style={[
            styles.button,
            (!hasPermission || loading) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>Refresh Token</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instruction}>1. Make sure you're logged in</Text>
        <Text style={styles.instruction}>2. Tap "Request Permissions"</Text>
        <Text style={styles.instruction}>3. Check console for token</Text>
        <Text style={styles.instruction}>
          4. Send test notification from Firebase Console
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  instruction: {
    fontSize: 12,
    marginBottom: 2,
    color: "#888",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PushNotificationDebug;
