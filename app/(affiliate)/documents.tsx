import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UploadCloud, Edit3, Trash2 } from 'lucide-react-native';

export default function AffiliateDocumentsScreen() {
    const router = useRouter();
    const [idUploaded, setIdUploaded] = useState(false);

    const handleNext = () => {
        // Complete onboarding and go to profile
        router.push('/(affiliate)/profile' as any);
    };

    const handleBack = () => {
        router.back();
    };

    const toggleUpload = () => {
        // Mocking an upload action
        setIdUploaded(!idUploaded);
    };

    const renderStepper = () => (
        <View style={styles.stepperContainer}>
            <Text style={styles.stepperTitle}>Mauzo by Tunzaa</Text>
            <View style={styles.stepperRow}>
                {/* Step 1 */}
                <View style={[styles.stepCircle, styles.stepCompleted]}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.stepLine, styles.stepLineCompleted]} />

                {/* Step 2 */}
                <View style={[styles.stepCircle, styles.stepCompleted]}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.stepLine, styles.stepLineCompleted]} />

                {/* Step 3 */}
                <View style={[styles.stepCircle, styles.stepCompleted]}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.stepLine, styles.stepLineCompleted]} />

                {/* Step 4 (Current) */}
                <View style={[styles.stepCircle, styles.stepCurrent]}>
                    <Text style={styles.stepTextCurrent}>4</Text>
                </View>
                <View style={styles.stepLine} />

                {/* Step 5 */}
                <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>5</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Spacer */}
                <View style={styles.headerSpacer} />

                {renderStepper()}

                <Text style={styles.screenTitle}>Hati Za Kampuni</Text>
                <Text style={styles.screenDescription}>
                    Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako.
                </Text>

                {/* Main White Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.cardHeader}>
                        <UploadCloud size={20} color="#7DBE4E" />
                        <Text style={styles.cardTitle}>Pakia taarifa zifuatazo</Text>
                    </View>

                    {/* Document Upload Item */}
                    <TouchableOpacity
                        style={[styles.uploadBox, idUploaded && styles.uploadBoxSuccess]}
                        onPress={toggleUpload}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.uploadBoxText}>Kitambulisho cha Taifa</Text>
                        {idUploaded ? (
                            <Trash2 size={20} color="#EF4444" />
                        ) : (
                            <Edit3 size={20} color="#3B5998" />
                        )}
                    </TouchableOpacity>

                    {idUploaded && (
                        <Text style={styles.successText}>Hati imepakiwa kikamilifu</Text>
                    )}
                </View>

                <View style={{ flex: 1 }} />

                {/* Bottom Action Buttons */}
                <View style={styles.bottomButtonsRow}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Rudi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.nextButton, !idUploaded && styles.nextButtonDisabled]}
                        onPress={handleNext}
                        disabled={!idUploaded}
                    >
                        <Text style={styles.nextButtonText}>Endelea</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#3B5998',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    headerSpacer: {
        height: 60,
    },
    stepperContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    stepperTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '70%',
        justifyContent: 'space-between',
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    stepCompleted: {
        backgroundColor: '#7DBE4E',
        borderColor: '#7DBE4E',
    },
    stepCurrent: {
        borderColor: '#7DBE4E',
    },
    stepText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepTextCurrent: {
        color: '#7DBE4E',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepLine: {
        height: 2,
        flex: 1,
        backgroundColor: '#FFFFFF',
        opacity: 0.5,
        marginHorizontal: 4,
    },
    stepLineCompleted: {
        backgroundColor: '#7DBE4E',
        opacity: 1,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    screenDescription: {
        fontSize: 14,
        color: '#E5E7EB',
        lineHeight: 22,
        marginBottom: 32,
        paddingRight: 20,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 8,
    },
    uploadBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
    },
    uploadBoxSuccess: {
        borderColor: '#7DBE4E',
        backgroundColor: '#F0FDF4', // Very light green
    },
    uploadBoxText: {
        fontSize: 14,
        color: '#3B5998', // Tunzaa blue text
        fontWeight: '500',
    },
    successText: {
        fontSize: 12,
        color: '#7DBE4E',
        marginTop: 8,
    },
    bottomButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    backButton: {
        flex: 1,
        height: 52,
        borderWidth: 1,
        borderColor: '#5B79B2',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: '#3B5998',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        height: 52,
        backgroundColor: '#7DBE4E',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
