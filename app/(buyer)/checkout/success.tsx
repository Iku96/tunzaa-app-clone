import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function SuccessScreen() {
    const router = useRouter();
    const [shoConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
    }, []);

    const handleContinue = () => {
        router.push('/(buyer)'); // Go back to home
    };

    return (
        <SafeAreaView style={styles.container}>
            {shoConfetti && <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut={true} />}

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#4A55A2" />
                </View>

                <Text style={styles.title}>Congratulation Fem!</Text>

                <Text style={styles.message}>
                    You've successfully made your first Installment payment for the <Text style={{ fontWeight: 'bold' }}>NIKE AIR JORDAN</Text>. Keep it up you're on your way to owning your goal!
                </Text>

                {/* Progress Visual (Mock) */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={styles.progressFill} />
                    </View>
                    <Text style={styles.progressText}>10%</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)', // Semi-transparent or white
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    progressContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 30,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        width: '10%',
        height: '100%',
        backgroundColor: '#4A55A2',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4A55A2',
    },
    button: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
