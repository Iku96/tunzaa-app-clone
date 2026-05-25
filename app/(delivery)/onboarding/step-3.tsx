import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/src/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function Step3Review() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useLanguage();

    const [onboardingData, setOnboardingData] = useState({
        region: params.region as string || '...',
        municipal: params.municipal as string || '...',
        ward: params.ward as string || '...',
        notes: params.extraInfo as string || '...',
        partnerType: '...',
        vehicleType: '...',
        plateNumber: '...',
    });

    useEffect(() => {
        (async () => {
            try {
                const savedLoc = await AsyncStorage.getItem('TEMP_ONBOARDING_LOCATION');
                const pType = await AsyncStorage.getItem('TEMP_ONBOARDING_PARTNER_TYPE');
                const vType = await AsyncStorage.getItem('TEMP_ONBOARDING_VEHICLE_TYPE');
                const pNumber = await AsyncStorage.getItem('TEMP_ONBOARDING_PLATE_NUMBER');
                
                let data = { region: '', municipal: '', ward: '', extraInfo: '' };
                if (savedLoc) {
                    data = JSON.parse(savedLoc);
                }

                setOnboardingData(prev => ({
                    ...prev,
                    region: data.region || prev.region,
                    municipal: data.municipal || prev.municipal,
                    ward: data.ward || prev.ward,
                    notes: data.extraInfo || prev.notes,
                    partnerType: pType === 'business' ? 'Kampuni' : (pType === 'individual' ? 'Mtu Binafsi' : prev.partnerType),
                    vehicleType: vType === 'car' ? 'Gari Ndogo' : (vType === 'truck' ? 'Lori' : (vType === 'motorcycle' ? 'Pikipiki' : prev.vehicleType)),
                    plateNumber: pNumber || prev.plateNumber,
                }));
            } catch (e) {
                console.error('❌ [Step3] Failed to load onboarding data:', e);
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.contentWrapper}>

                <View>
                    <Text style={styles.title}>{t.onboardingStep4Title}</Text>
                    <Text style={styles.subtitle}>
                        {t.onboardingStep4Subtitle}
                    </Text>

                    {/* WHITE CARD CONTAINER */}
                    <View style={styles.card}>

                        {/* CARD HEADER */}
                        <View style={styles.cardHeader}>
                            <View style={styles.headerTitleRow}>
                                {/* Custom Location Icon */}
                                <Image
                                    source={require('../../../assets/location-icon.png')}
                                    style={styles.customIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardTitle}>{t.onboardingStep3Title}</Text>
                            </View>

                            {/* CUSTOM EDIT BUTTON */}
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => router.back()}
                            >
                                <Image
                                    source={require('../../../assets/pencil-square.png')}
                                    style={styles.editIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.editButtonText}>{t.onboardingStep4Edit}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* 3x2 GRID LAYOUT */}
                        <View style={styles.gridContainer}>
                            {/* Row 1, Col 1: Aina ya Ubia */}
                            <View style={styles.gridItem}>
                                <Text style={styles.detailLabel}>Aina ya Ubia</Text>
                                <Text style={styles.detailValue}>{onboardingData.partnerType}</Text>
                            </View>

                            {/* Row 1, Col 2: Aina ya Usafiri */}
                            <View style={styles.gridItem}>
                                <Text style={styles.detailLabel}>Aina ya Usafiri</Text>
                                <Text style={styles.detailValue}>{onboardingData.vehicleType} - {onboardingData.plateNumber}</Text>
                            </View>

                            {/* Row 2, Col 1: Mkoa */}
                            <View style={styles.gridItem}>
                                <Text style={styles.detailLabel}>{t.onboardingStep3RegionLabel}</Text>
                                <Text style={styles.detailValue}>{onboardingData.region}</Text>
                            </View>

                            {/* Row 2, Col 2: Wilaya */}
                            <View style={styles.gridItem}>
                                <Text style={styles.detailLabel}>{t.onboardingStep3MunicipalLabel}</Text>
                                <Text style={styles.detailValue}>{onboardingData.municipal}</Text>
                            </View>

                            {/* Row 3, Col 1: Kata */}
                            <View style={styles.gridItem}>
                                <Text style={styles.detailLabel}>{t.onboardingStep3WardLabel}</Text>
                                <Text style={styles.detailValue}>{onboardingData.ward}</Text>
                            </View>

                            {/* Row 3, Col 2: Maelezo */}
                            <View style={styles.gridItem}>
                                <Text style={styles.detailLabel}>{t.onboardingStep4NotesLabel}</Text>
                                <Text style={styles.notesValue} numberOfLines={3}>
                                    {onboardingData.notes}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.dividerLight} />

                        {/* REMOVED ONGEZA DUKA LINK AS IT MAKES NO SENSE FOR DRIVERS */}

                    </View>

                </View>

                {/* FOOTER BUTTONS */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>{t.onboardingStep1Back}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={() => router.push('/(delivery)/onboarding/step-4')}
                    >
                        <Text style={styles.nextButtonText}>{t.onboardingStep1Next}</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#425BA4',
    },
    contentWrapper: {
        flex: 1,
        // Removed 'justifyContent: space-between' to stop forcing buttons to bottom
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
        fontFamily: 'Gilroy-Regular',
    },
    // CARD STYLES
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    customIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: 'Gilroy-SemiBold',
    },

    // EDIT BUTTON STYLES
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editIcon: {
        width: 14,
        height: 14,
        marginRight: 6,
        tintColor: '#425BA4',
    },
    editButtonText: {
        fontSize: 12,
        color: '#425BA4',
        fontWeight: '600',
    },

    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        width: '100%',
        marginBottom: 20,
    },
    dividerLight: {
        height: 1,
        backgroundColor: '#F3F4F6',
        width: '100%',
        marginVertical: 16,
    },

    // GRID STYLES
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%', // 2 Columns
        marginBottom: 20, // Vertical spacing between rows
        paddingRight: 8,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
    },
    notesValue: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
        lineHeight: 20,
        fontStyle: 'italic',
    },

    // LINK INSIDE CARD
    cardFooterLink: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    textLinkQuestion: {
        color: '#6B7280',
        fontSize: 14,
    },
    textLinkAction: {
        color: '#84CC16',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },

    // FOOTER
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30, // ✅ Added top margin to bring it closer to the card
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