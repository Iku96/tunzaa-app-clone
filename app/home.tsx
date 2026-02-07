import { View, Text, StyleSheet } from 'react-native';

/**
 * Placeholder Home Screen
 * Will be replaced with the actual marketplace home screen.
 * Uses StyleSheet (not NativeWind className) to avoid Android native prop type issues.
 */
export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Tunzaa!</Text>
            <Text style={styles.subtitle}>Marketplace coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        color: '#1F2937',
        fontSize: 20,
        fontWeight: '600',
    },
    subtitle: {
        color: '#6B7280',
        fontSize: 16,
        marginTop: 8,
    },
});
