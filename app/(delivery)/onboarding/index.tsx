import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { Camera, LogOut } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { height } = Dimensions.get('window');

export default function Step1Details() {
    const router = useRouter();
    const { user, logout } = useTunzaaAuth();
    const { t } = useLanguage();

    const [shopName, setShopName] = useState(user?.display_name || '');
    const [phone, setPhone] = useState(user?.phone_number || '');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [plateNumber, setPlateNumber] = useState('');
    const [logoImage, setLogoImage] = useState<string | null>(null);

    // New delivery fields
    const [partnerType, setPartnerType] = useState<'individual' | 'business'>('individual');
    const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car' | 'truck'>('motorcycle');

    useEffect(() => {
        (async () => {
            try {
                const [sName, sPhone, sDesc, sPType, sVType, sCover, sLogo, sPlate] = await Promise.all([
                    AsyncStorage.getItem('TEMP_ONBOARDING_SHOP_NAME'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_PHONE'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_DESCRIPTION'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_PARTNER_TYPE'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_VEHICLE_TYPE'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_COVER'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_LOGO'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_PLATE_NUMBER'),
                ]);
                
                if (sName) setShopName(sName);
                if (sPhone) setPhone(sPhone);
                if (sDesc) setDescription(sDesc);
                if (sPType) setPartnerType(sPType as any);
                if (sVType) setVehicleType(sVType as any);
                if (sCover) setCoverImage(sCover);
                if (sLogo) setLogoImage(sLogo);
                if (sPlate) setPlateNumber(sPlate);
            } catch (error) {
                console.error("Failed to load saved onboarding details", error);
            }
        })();
    }, []);

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

        if (!plateNumber.trim()) {
            alert("Tafadhali weka Namba ya Chombo / Plate Number.");
            return;
        }

        setLoading(true);
        try {
            // Persist shop details for late creation
            const { STORAGE_KEYS } = require('@/src/services/config');
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            
            await Promise.all([
                AsyncStorage.setItem('TEMP_ONBOARDING_SHOP_NAME', shopName.trim()),
                AsyncStorage.setItem('TEMP_ONBOARDING_PHONE', phone.trim()),
                AsyncStorage.setItem('TEMP_ONBOARDING_DESCRIPTION', description.trim()),
                AsyncStorage.setItem('TEMP_ONBOARDING_PARTNER_TYPE', partnerType),
                AsyncStorage.setItem('TEMP_ONBOARDING_VEHICLE_TYPE', vehicleType),
                AsyncStorage.setItem('TEMP_ONBOARDING_PLATE_NUMBER', plateNumber.trim()),
                coverImage ? AsyncStorage.setItem('TEMP_ONBOARDING_COVER', coverImage) : Promise.resolve(),
                logoImage ? AsyncStorage.setItem('TEMP_ONBOARDING_LOGO', logoImage) : Promise.resolve(),
            ]);
            
            console.log('✅ [Step2] Shop details persisted');
            
            // Navigate to Step 2 (Location Screen)
            router.push('/(delivery)/onboarding/step-2');
        } catch (e) {
            console.error('❌ [Step2] Failed to save shop details:', e);
        } finally {
            setLoading(false);
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.title}>Taarifa Zako Kama Dereva</Text>
                            <TouchableOpacity 
                                onPress={logout}
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 }}
                            >
                                <LogOut size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.subtitle}>
                            Logo, jina na maelezo yako ni muhimu katika kuunda wasifu wako Tunzaa.
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
                                        <Text style={styles.logoText}>Weka logo*</Text>
                                    )}
                                    <View style={styles.plusBadge}>
                                        <Ionicons name="add" size={14} color="#3A5BA9" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Aina ya Ubia (Partner Type)</Text>
                                    <View style={styles.pillContainer}>
                                        <TouchableOpacity 
                                            style={[styles.pill, partnerType === 'individual' && styles.pillActive]} 
                                            onPress={() => setPartnerType('individual')}
                                        >
                                            <Text style={[styles.pillText, partnerType === 'individual' && styles.pillTextActive]}>Mtu Binafsi</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.pill, partnerType === 'business' && styles.pillActive]} 
                                            onPress={() => setPartnerType('business')}
                                        >
                                            <Text style={[styles.pillText, partnerType === 'business' && styles.pillTextActive]}>Kampuni</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Aina ya Usafiri (Vehicle Type)</Text>
                                    <View style={styles.pillContainer}>
                                        <TouchableOpacity 
                                            style={[styles.pill, vehicleType === 'motorcycle' && styles.pillActive]} 
                                            onPress={() => setVehicleType('motorcycle')}
                                        >
                                            <Text style={[styles.pillText, vehicleType === 'motorcycle' && styles.pillTextActive]}>Pikipiki</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.pill, vehicleType === 'car' && styles.pillActive]} 
                                            onPress={() => setVehicleType('car')}
                                        >
                                            <Text style={[styles.pillText, vehicleType === 'car' && styles.pillTextActive]}>Gari Ndogo</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.pill, vehicleType === 'truck' && styles.pillActive]} 
                                            onPress={() => setVehicleType('truck')}
                                        >
                                            <Text style={[styles.pillText, vehicleType === 'truck' && styles.pillTextActive]}>Lori</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Namba ya Chombo (Plate Number) *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={plateNumber}
                                        onChangeText={setPlateNumber}
                                        placeholder="Mfano: MC 123 ABC"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="characters"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{partnerType === 'business' ? 'Jina la Kampuni' : 'Jina Kamili'}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={shopName}
                                        onChangeText={setShopName}
                                        placeholder={partnerType === 'business' ? "Weka jina la kampuni" : "Weka jina lako"}
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
                                        <Text style={styles.label}>Weka Maelezo zaidi *</Text>
                                    </View>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Weka maelezo hapa"
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        textAlignVertical="top"
                                    />
                                    <Text style={styles.charCount}>Isizidi maneno 240</Text>
                                </View>
                                <Text style={styles.requiredText}>{t.onboardingStep2Required} <Text style={{ color: 'red' }}>*</Text></Text>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>

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
    container: { flex: 1, backgroundColor: '#425BA4' },
    contentContainer: { flexGrow: 1, paddingBottom: 100 },
    staticContent: { paddingHorizontal: 20, paddingBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'left', marginTop: 0, fontFamily: 'Gilroy-Bold' },
    subtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'left', marginTop: 8, marginBottom: 25, paddingRight: 20, lineHeight: 20, fontFamily: 'Gilroy-Regular' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', alignSelf: 'center', minHeight: 396, paddingBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
    coverImageContainer: { width: '100%', height: 112, backgroundColor: '#CBDAFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'relative', justifyContent: 'center', overflow: 'hidden' },
    coverImage: { width: '100%', height: '100%' },
    cameraIconContainer: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#FFFFFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    logoContainer: { alignItems: 'center', marginTop: -40, marginBottom: 10 },
    logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#3A5BA9', position: 'relative', overflow: 'visible' },
    logoImage: { width: 76, height: 76, borderRadius: 38 },
    logoText: { fontSize: 10, color: '#1F2937', textAlign: 'center' },
    plusBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#3A5BA9', justifyContent: 'center', alignItems: 'center', zIndex: 12 },
    formContent: { paddingHorizontal: 20, marginTop: 10 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6, textAlign: 'left' },
    input: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#111827', paddingVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 8 },
    textArea: { textAlign: 'left', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, height: 120, fontWeight: '400', fontSize: 14, marginTop: 6, color: '#111827', textAlignVertical: 'top' },
    charCount: { fontSize: 10, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
    requiredText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, backgroundColor: '#425BA4' },
    backButton: { width: 154, height: 53, borderRadius: 8, borderWidth: 1, borderColor: '#7EC155', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
    buttonTextOutline: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    nextButton: { width: 154, height: 53, borderRadius: 8, backgroundColor: '#84CC16', alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    pillContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    pill: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    pillActive: { backgroundColor: '#EFF6FF', borderColor: '#3A5BA9' },
    pillText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
    pillTextActive: { color: '#3A5BA9', fontWeight: '700' }
});