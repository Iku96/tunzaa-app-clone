import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Step4Map() {
    const router = useRouter();

    const handleFinish = () => {
        // Complete onboarding
        // Navigate to Merchant Dashboard
        router.replace('/(merchant)/live-orders');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Eneo La Duka</Text>
            <Text style={styles.subtitle}>
                Wezesha wateja kufata bidhaa kwa urahisi kwa kuweka eneo la duka lako.
            </Text>

            <View style={styles.card}>
                <View style={styles.header}>
                    <Ionicons name="location-outline" size={24} color="#425BA4" />
                    <Text style={styles.headerText}>Weka eneo la duka</Text>
                </View>

                {/* Map Placeholder */}
                <View style={styles.mapContainer}>
                    {/* In a real app, use react-native-maps here */}
                    <Text style={{ color: '#6B7280' }}>Map View Placeholder</Text>
                    <Ionicons name="map" size={48} color="#D1D5DB" />
                </View>

                <TouchableOpacity style={styles.locationButton}>
                    <Text style={styles.locationButtonText}>Weka Mwenyewe</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <Text style={styles.dividerText}>Au</Text>
                </View>

                <TouchableOpacity style={styles.autoLocationButton}>
                    <Text style={styles.autoLocationText}>Chagua eneo moja kwa moja</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.buttonTextOutline}>Rudi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
                    <Text style={styles.buttonText}>Kamilisha</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        minHeight: 400,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    mapContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    locationButton: {
        width: '100%',
        backgroundColor: '#425BA4',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    locationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        marginVertical: 16,
    },
    dividerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    autoLocationButton: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    autoLocationText: {
        color: '#425BA4',
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        marginBottom: 20,
    },
    backButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 30,
        minWidth: 100,
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: '#84CC16', // Lime Green
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 30,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextOutline: {
        color: '#FFFFFF',
        fontSize: 16,
    }
});
