import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TANZANIAN_BANKS, Bank } from '../../../src/constants/banks';

const { height } = Dimensions.get('window');

export default function Step2Details() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { t } = useLanguage();

    const [shopName, setShopName] = useState('');
    const [phone, setPhone] = useState(user?.phone_number || '');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);

    // Bank Details
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '');
    const [showBankPicker, setShowBankPicker] = useState(false);
    const [bankSearch, setBankSearch] = useState('');

    const pickImage = async (type: 'cover' | 'logo') => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert(t.onboardingStep2PermissionError);
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
        if (!shopName.trim()) {
            alert(t.onboardingStep2ValidationShopName);
            return;
        }

        setLoading(true);
        try {
            // Persist shop details for late creation
            const { STORAGE_KEYS } = require('../../../src/services/config');
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            
            await Promise.all([
                AsyncStorage.setItem('TEMP_ONBOARDING_SHOP_NAME', shopName.trim()),
                AsyncStorage.setItem('TEMP_ONBOARDING_PHONE', phone.trim()),
                AsyncStorage.setItem('TEMP_ONBOARDING_DESCRIPTION', description.trim()),
                coverImage ? AsyncStorage.setItem('TEMP_ONBOARDING_COVER', coverImage) : Promise.resolve(),
                logoImage ? AsyncStorage.setItem('TEMP_ONBOARDING_LOGO', logoImage) : Promise.resolve(),
                // Bank Details
                selectedBank ? AsyncStorage.setItem('TEMP_ONBOARDING_BANK_NAME', selectedBank.name) : Promise.resolve(),
                selectedBank ? AsyncStorage.setItem('TEMP_ONBOARDING_BANK_SWIFT', selectedBank.swift_code) : Promise.resolve(),
                AsyncStorage.setItem('TEMP_ONBOARDING_BANK_ACC_NUMBER', accountNumber),
                AsyncStorage.setItem('TEMP_ONBOARDING_BANK_ACC_NAME', accountName),
            ]);
            
            console.log('✅ [Step2] Shop details persisted');
            
            // Navigate to Step 3 (Selection Screen)
            router.push('/(merchant)/onboarding/step-3');
        } catch (e) {
            console.error('❌ [Step2] Failed to save shop details:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {/* ✅ ADDED BACKGROUND COLOR TO FIX TRANSITION OVERLAP */}
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
                        <Text style={styles.title}>{t.onboardingStep2Title}</Text>
                        <Text style={styles.subtitle}>
                            {t.onboardingStep2Subtitle}
                        </Text>

                        <View style={styles.card}>
                            <View style={styles.coverImageContainer}>
                                {coverImage && <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />}
                                <TouchableOpacity style={styles.cameraIconContainer} onPress={() => pickImage('cover')}>
                                    <Camera size={20} color="#3A5BA9" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.logoContainer}>
                                <TouchableOpacity style={styles.logoCircle} onPress={() => pickImage('logo')}>
                                    {logoImage ? (
                                        <Image source={{ uri: logoImage }} style={styles.logoImage} />
                                    ) : (
                                        <Text style={styles.logoText}>{t.onboardingStep2AddLogo}</Text>
                                    )}
                                    <View style={styles.plusBadge}>
                                        <Ionicons name="add" size={14} color="#3A5BA9" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{t.onboardingStep2CompanyName}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={shopName}
                                        onChangeText={setShopName}
                                        placeholder={t.onboardingStep2CompanyNamePlaceholder}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{t.onboardingStep2Phone}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder={t.onboardingStep2PhonePlaceholder}
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.label}>{t.onboardingStep2Description} <Text style={{ color: 'red' }}>*</Text></Text>
                                    </View>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder={t.onboardingStep2DescriptionPlaceholder}
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                    <Text style={styles.charCount}>{t.onboardingStep2CharLimit}</Text>
                                </View>

                                {/* Bank Details Section */}
                                <View style={{ marginTop: 20, marginBottom: 10 }}>
                                    <View style={styles.divider} />
                                    <Text style={[styles.title, { fontSize: 18, marginTop: 20, color: '#1F2937' }]}>Commercial Details</Text>
                                    <Text style={styles.label}>Bank details for payments</Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Bank Name <Text style={{ color: 'red' }}>*</Text></Text>
                                    <TouchableOpacity 
                                        style={styles.input} 
                                        onPress={() => setShowBankPicker(!showBankPicker)}
                                    >
                                        <Text style={{ color: selectedBank ? '#1F2937' : '#9CA3AF' }}>
                                            {selectedBank ? selectedBank.name : 'Select your bank'}
                                        </Text>
                                        <Ionicons 
                                            name={showBankPicker ? "chevron-up" : "chevron-down"} 
                                            size={18} 
                                            color="#9CA3AF" 
                                            style={{ position: 'absolute', right: 16 }}
                                        />
                                    </TouchableOpacity>

                                    {showBankPicker && (
                                        <View style={styles.bankPickerList}>
                                            <TextInput
                                                style={styles.bankSearchInput}
                                                placeholder="Search bank..."
                                                value={bankSearch}
                                                onChangeText={setBankSearch}
                                            />
                                            {TANZANIAN_BANKS
                                                .filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
                                                .map((bank) => (
                                                <TouchableOpacity 
                                                    key={bank.id} 
                                                    style={styles.bankItem}
                                                    onPress={() => {
                                                        setSelectedBank(bank);
                                                        setShowBankPicker(false);
                                                    }}
                                                >
                                                    <Text style={styles.bankItemText}>{bank.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Account Name <Text style={{ color: 'red' }}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        value={accountName}
                                        onChangeText={setAccountName}
                                        placeholder="Full name as on bank account"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Account Number <Text style={{ color: 'red' }}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        value={accountNumber}
                                        onChangeText={setAccountNumber}
                                        placeholder="e.g. 015243..."
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <Text style={styles.requiredText}>{t.onboardingStep2Required} <Text style={{ color: 'red' }}>*</Text></Text>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                {/* Footer Pinned Outside Scroll */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.buttonTextOutline}>{t.onboardingStep1Back}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? t.onboardingStep1Saving : t.onboardingStep1Next}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#315BA9', // ✅ FIX: Prevents overlapping during transitions
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 100,
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
        fontFamily: 'System',
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
        borderColor: '#3A5BA9',
        position: 'relative',
        overflow: 'visible'
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
        borderColor: '#3A5BA9',
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
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    phoneText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#374151',
        marginTop: -10,
        fontWeight: '500',
    },
    textArea: {
        textAlign: 'left',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        height: 120,
        fontWeight: '400',
        fontSize: 14,
        marginTop: 6,
        color: '#111827',
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 10,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 4,
    },
    requiredText: {
        fontSize: 12,
        color: '#9CA3AF',
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
    backButton: {
        width: 154,
        height: 53,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#7EC155', // ✅ FIX: Green Border
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTextOutline: {
        color: '#FFFFFF', // White text
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
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        width: '100%',
    },
    bankPickerList: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 250,
        overflow: 'hidden',
        // Shadow for picker
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    bankSearchInput: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        fontSize: 14,
        color: '#1F2937',
    },
    bankItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    bankItemText: {
        fontSize: 14,
        color: '#374151',
    },
});