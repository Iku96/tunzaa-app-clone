import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function LoanLocationChooser() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <View style={styles.contentWrapper}>
                <View>
                    <Text style={styles.title}>Eneo La Kampuni</Text>
                    <Text style={styles.subtitle}>
                        Wezesha wateja kukufikia kwa urahisi kwa kuweka eneo la Kampuni yako.
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Image
                                source={require('@/assets/location-icon.png')}
                                style={{ width: 24, height: 24, marginRight: 10 }}
                                resizeMode="contain"
                            />
                            <Text style={styles.cardTitle}>Weka eneo la Kampuni</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.actionContainer}>
                            <TouchableOpacity
                                style={styles.manualButton}
                                onPress={() => router.push('/(loan)/onboarding/step-2-manual')}
                            >
                                <Text style={styles.manualButtonText}>Weka Mwenyewe</Text>
                            </TouchableOpacity>

                            <Text style={styles.orText}>Au</Text>

                            <TouchableOpacity
                                style={styles.gpsButton}
                                onPress={() => router.push('/(loan)/onboarding/step-2-map')}
                            >
                                <Text style={styles.gpsButtonText}>Chagua eneo moja kwa moja</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Rudi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={() => router.push('/(loan)/onboarding/step-3')}
                    >
                        <Text style={styles.nextButtonText}>Endelea</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#315BA9',
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left',
        fontFamily: 'Gilroy-Bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#E0E7FF',
        textAlign: 'left',
        marginTop: 8,
        marginBottom: 25,
        paddingRight: 20,
        lineHeight: 20,
        fontFamily: 'System',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        alignSelf: 'center',
        paddingVertical: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: 'Gilroy-SemiBold',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        width: '100%',
        marginBottom: 24,
    },
    actionContainer: {
        paddingHorizontal: 24,
        paddingBottom: 10,
    },
    manualButton: {
        backgroundColor: '#425BA4',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    manualButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    orText: {
        textAlign: 'center',
        color: '#9CA3AF',
        marginVertical: 12,
        fontSize: 14,
    },
    gpsButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gpsButtonText: {
        color: '#425BA4',
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 154,
        height: 53,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#7EC155',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        width: 154,
        height: 53,
        borderRadius: 8,
        backgroundColor: '#84CC16',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
