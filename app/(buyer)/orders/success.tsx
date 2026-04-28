import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Delivery Illustration
const DELIVERY_ILLUSTRATION = 'https://img.freepik.com/free-vector/delivery-service-illustrated_23-2148505081.jpg?w=826&t=st=1709849000~exp=1709849600~hmac=...'; // Replace with local asset

export default function OrderSuccessScreen() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to tracking after a few seconds
        const timer = setTimeout(() => {
            router.replace('/(buyer)/orders/tracking');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={{ uri: DELIVERY_ILLUSTRATION }}
                    style={styles.illustration}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Your Order successfully assigned</Text>

                <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryLabel}>— Delivery from —</Text>
                    <View style={styles.locationContainer}>
                        {/* Icon placeholder */}
                        <Text style={styles.locationText}>Dar es salaam</Text>
                        <Text style={styles.subText}>Wasafi Shoppers, Haile Rd</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    illustration: {
        width: width * 0.8,
        height: width * 0.8,
        marginBottom: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 32,
    },
    deliveryInfo: {
        alignItems: 'center',
        width: '100%',
    },
    deliveryLabel: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 16,
    },
    locationContainer: {
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    subText: {
        fontSize: 14,
        color: '#6B7280',
    },
});
