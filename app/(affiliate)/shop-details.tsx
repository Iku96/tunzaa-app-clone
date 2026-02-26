import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ArrowLeft } from 'lucide-react-native';

export default function AffiliateShopDetailsScreen() {
    const router = useRouter();
    const [businessName, setBusinessName] = useState('');
    const [description, setDescription] = useState('');

    const handleNext = () => {
        router.push('/(affiliate)/interests' as any);
    };

    const handleBack = () => {
        router.back();
    };

    // We can render a mock stepper
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

                {/* Step 3 (Current) */}
                <View style={[styles.stepCircle, styles.stepCurrent]}>
                    <Text style={styles.stepTextCurrent}>3</Text>
                </View>
                <View style={styles.stepLine} />

                {/* Step 4 */}
                <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>4</Text>
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
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header with Back Button */}
                    <View style={styles.header}>
                        {/* Empty space to mimic the screenshot, although it shows no back button, it's good practice */}
                    </View>

                    {renderStepper()}

                    <Text style={styles.screenTitle}>Weka Taarifa Zako Kama Winga</Text>
                    <Text style={styles.screenDescription}>
                        Logo, jina la duka na maelezo ya duka ni muhimu katika kuunda duka lako Tunzaa.
                    </Text>

                    {/* Main White Card */}
                    <View style={styles.cardContainer}>
                        {/* Banner Top Area */}
                        <View style={styles.bannerArea}>
                            <TouchableOpacity style={styles.cameraIconButton}>
                                <Ionicons name="camera-outline" size={18} color="#3B5998" />
                            </TouchableOpacity>
                        </View>

                        {/* Circular Logo Upload */}
                        <View style={styles.logoUploadContainer}>
                            <TouchableOpacity style={styles.logoCircle}>
                                <Text style={styles.logoText}>Weka logo<Text style={styles.requiredAsterisk}>*</Text></Text>
                            </TouchableOpacity>
                            {/* Plus Icon overlapping bottom right */}
                            <View style={styles.plusIconContainer}>
                                <Ionicons name="add-circle" size={24} color="#3B5998" />
                            </View>
                        </View>

                        <View style={styles.formContent}>
                            <TextInput
                                style={styles.input}
                                placeholder="Add business name"
                                placeholderTextColor="#6B7280"
                                value={businessName}
                                onChangeText={setBusinessName}
                            />

                            <Text style={styles.label}>
                                Weka Maelezo zaidi <Text style={styles.requiredAsterisk}>*</Text>
                            </Text>

                            <View style={styles.textAreaContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Weka maelezo hapa"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    value={description}
                                    onChangeText={setDescription}
                                    maxLength={240}
                                />
                                <Text style={styles.charCount}>Isizidi maneno 240</Text>
                            </View>

                            <Text style={styles.requiredNote}>Sehemu ya lazima <Text style={styles.requiredAsterisk}>*</Text></Text>
                        </View>
                    </View>

                    <View style={{ flex: 1 }} />

                    {/* Bottom Action Buttons */}
                    <View style={styles.bottomButtonsRow}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.backButtonText}>Rudi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextButtonText}>Endelea</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#3B5998', // Blue background based on screenshot
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        height: 60,
        justifyContent: 'center',
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
        backgroundColor: '#7DBE4E', // Green check
        borderColor: '#7DBE4E',
    },
    stepCurrent: {
        borderColor: '#7DBE4E', // Green border but clear inside
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
        textAlign: 'center',
    },
    screenDescription: {
        fontSize: 14,
        color: '#E5E7EB',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 30,
    },
    bannerArea: {
        backgroundColor: '#D1E0FC', // Light blue banner
        height: 100,
        position: 'relative',
    },
    cameraIconButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoUploadContainer: {
        alignItems: 'center',
        marginTop: -50, // Half of height to overlap
        zIndex: 10,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#3B5998',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoText: {
        fontSize: 12,
        color: '#4B5563',
    },
    plusIconContainer: {
        position: 'absolute',
        bottom: 0,
        marginLeft: 60, // approximate positioning to bottom right of circle
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    formContent: {
        padding: 24,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#111827',
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    requiredAsterisk: {
        color: '#EF4444', // Red asterisk
    },
    textAreaContainer: {
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        padding: 16,
        fontSize: 14,
        color: '#111827',
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        paddingRight: 12,
        paddingBottom: 12,
    },
    requiredNote: {
        fontSize: 12,
        color: '#9CA3AF',
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
        backgroundColor: '#3B5998', // Match background so it looks outline
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        height: 52,
        backgroundColor: '#7DBE4E', // Green
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
