import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoanProviderOnboardingStep1() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { t } = useLanguage();

    const [companyName, setCompanyName] = useState(user?.display_name || '');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);

    const pickImage = async (type: 'cover' | 'logo') => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access gallery is required.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: type === 'logo' ? [1, 1] : [3, 1],
                quality: 0.8,
            });
            if (!result.canceled) {
                if (type === 'cover') setCoverImage(result.assets[0].uri);
                else setLogoImage(result.assets[0].uri);
            }
        } catch (err) {
            console.error('Error picking image:', err);
        }
    };

    const handleNext = async () => {
        if (!companyName.trim()) {
            Alert.alert('Validation Error', 'Jina la kampuni ni lazima.');
            return;
        }

        try {
            // Save state locally before moving to location step
            await AsyncStorage.setItem('TEMP_ONBOARDING_SHOP_NAME', companyName.trim());
            await AsyncStorage.setItem('TEMP_ONBOARDING_DESCRIPTION', description.trim());
            if (logoImage) await AsyncStorage.setItem('TEMP_ONBOARDING_LOGO', logoImage);
            if (coverImage) await AsyncStorage.setItem('TEMP_ONBOARDING_COVER', coverImage);
            
            router.push('/(loan)/onboarding/step-2');
        } catch (e: any) {
            console.error('❌ Failed to save step 1 data:', e);
            Alert.alert('Error', 'Could not save company details locally.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={50}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.staticContent}>
                        <Text style={styles.title}>Weka Taarifa Za Kampuni</Text>
                        <Text style={styles.subtitle}>
                            Logo, jina la Kampuni na maelezo ya Kampuni ni muhimu katika Kuamilisha kampuni yako Tunzaa.
                        </Text>

                        {/* White Card */}
                        <View style={styles.card}>
                            {/* Cover Image */}
                            <View style={styles.coverImageContainer}>
                                {coverImage && <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />}
                                <TouchableOpacity style={styles.cameraIconContainer} onPress={() => pickImage('cover')}>
                                    <Camera size={20} color="#3A5BA9" />
                                </TouchableOpacity>
                            </View>

                            {/* Circular Logo */}
                            <View style={styles.logoContainer}>
                                <TouchableOpacity style={styles.logoCircle} onPress={() => pickImage('logo')}>
                                    {logoImage ? (
                                        <Image source={{ uri: logoImage }} style={styles.logoImage} />
                                    ) : (
                                        <Text style={styles.logoText}>Weka logo*</Text>
                                    )}
                                    <View style={styles.plusBadge}>
                                        <Ionicons name="add" size={14} color="#3A5BA9" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Jina la kampuni *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={companyName}
                                        onChangeText={setCompanyName}
                                        placeholder="Mzabayuni Travel & co"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Maelezo ya ziada *</Text>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Maelezo ya ziada"
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        maxLength={240}
                                        textAlignVertical="top"
                                    />
                                    <Text style={styles.charCount}>Isizidi maneno 240</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.backButtonBottom} onPress={() => router.back()}>
                        <Text style={styles.buttonTextOutline}>Rudi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.buttonText}>Endelea</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#315BA9', // Tunzaa Blue
    },
    contentContainer: {
        paddingBottom: 120,
    },
    staticContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left',
        marginTop: 0,
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
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        alignSelf: 'center',
        minHeight: 396,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    coverImageContainer: {
        width: '100%',
        height: 112,
        backgroundColor: '#CBDAFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'relative',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    cameraIconContainer: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#FFFFFF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: -40,
        marginBottom: 10,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#315BA9',
        position: 'relative',
        overflow: 'visible',
    },
    logoImage: {
        width: 76,
        height: 76,
        borderRadius: 38,
    },
    logoText: {
        fontSize: 10,
        color: '#1F2937',
        textAlign: 'center',
    },
    plusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#315BA9',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 12,
    },
    formContent: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        textAlign: 'left',
    },
    input: {
        textAlign: 'left',
        fontSize: 14,
        color: '#111827',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    textArea: {
        textAlign: 'left',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        height: 120,
        fontSize: 14,
        color: '#111827',
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 10,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 20,
        backgroundColor: '#315BA9',
    },
    backButtonBottom: {
        width: '48%',
        height: 53,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTextOutline: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        width: '48%',
        height: 53,
        borderRadius: 8,
        backgroundColor: '#84CC16',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
