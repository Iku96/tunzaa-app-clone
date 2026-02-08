import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Forgot Password Screen (Stub)
 * TODO: Implement forgot password flow
 */
export default function ForgotPasswordScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        Password recovery feature coming soon.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    container: {
        flex: 1,
        padding: 20,
    },

    backButton: {
        padding: 8,
        alignSelf: 'flex-start',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontFamily: 'System',
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1E1F',
        marginBottom: 12,
    },

    subtitle: {
        fontFamily: 'System',
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
});
