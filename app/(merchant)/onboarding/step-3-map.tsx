import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import MapView, { Marker, Region, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ✅ STATIC DATA 
const LOCATION_DATA: any = {
    'Dar es Salaam': {
        coords: { latitude: -6.7924, longitude: 39.2083 },
        districts: {
            'Ilala': ['Kivukoni', 'Upanga Mashariki', 'Kisutu', 'Jangwani'],
            'Kinondoni': ['Magomeni', 'Kijitonyama', 'Hananasif', 'Mwananyamala'],
            'Ubungo': ['Ubungo', 'Kibamba', 'Mbezi', 'Manzese'],
            'Temeke': ['Temeke', 'Kurasini', 'Chang’ombe', 'Mtoni'],
            'Kigamboni': ['Kigamboni', 'Tungi', 'Vijibweni', 'Mjimwema']
        }
    },
    'Arusha': {
        coords: { latitude: -3.3869, longitude: 36.6830 },
        districts: {
            'Arusha City': ['Sekei', 'Kaloleni', 'Themi', 'Lemara', 'Kimandolu'],
            'Meru': ['Akheri', 'Majiyachai', 'Usa River', 'Leguruki'],
            'Monduli': ['Monduli mjini', 'Engutoto', 'Moita']
        }
    },
    'Dodoma': {
        coords: { latitude: -6.1630, longitude: 35.7516 },
        districts: {
            'Dodoma Urban': ['Kikuyu', 'Makole', 'Madukani', 'Majengo'],
            'Bahi': ['Bahi', 'Lamaiti'],
            'Kondoa': ['Kondoa Mjini']
        }
    }
};

export default function Step3Map() {
    const router = useRouter();
    const { t } = useLanguage();
    const mapRef = useRef<MapView>(null);

    // Map State
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: -6.7924,
        longitude: 39.2083,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // Form State
    const [region, setRegion] = useState('');
    const [municipal, setMunicipal] = useState('');
    const [ward, setWard] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [loading, setLoading] = useState(false);

    // Dropdown Control
    const [activeField, setActiveField] = useState<string | null>(null);

    // 1️⃣ Get User Location on Mount
    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    console.log('📍 [Step3Map] Location permission granted, fetching position...');
                    let location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    
                    const newRegion = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                    console.log(`📍 [Step3Map] Current position: ${newRegion.latitude}, ${newRegion.longitude}`);
                    setMapRegion(newRegion);
                    mapRef.current?.animateToRegion(newRegion, 1000);
                } else {
                    console.warn('⚠️ [Step3Map] Location permission denied');
                }
            } catch (error) {
                console.error('❌ [Step3Map] Error fetching location:', error);
            }
        })();
    }, []);

    // 2️⃣ Handle Map Drag/Tap
    const onLocationChange = (coord: { latitude: number, longitude: number }) => {
        console.log(`📍 [Step3Map] Map location changed: ${coord.latitude}, ${coord.longitude}`);
        setMapRegion(prev => ({ ...prev, ...coord }));
    };

    const handleSave = async () => {
        // Validation check
        if (!region || !municipal || !ward) {
            alert(t.onboardingStep3ValidationLocation);
            return;
        }

        setLoading(true);
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem('TEMP_ONBOARDING_LOCATION', JSON.stringify({
                region,
                municipal,
                ward,
                extraInfo,
                coords: {
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude
                }
            }));
            console.log('✅ [Step3Map] Location persisted');

            router.push({
                pathname: '/(merchant)/onboarding/step-4',
                params: {
                    region,
                    municipal,
                    ward,
                    extraInfo
                }
            });
        } catch (e) {
            console.error('❌ [Step3Map] Save failed:', e);
        } finally {
            setLoading(false);
        }
    };

    // ✅ REUSABLE AUTOCOMPLETE
    const renderAutocomplete = (
        label: string,
        value: string,
        setValue: (text: string) => void,
        fieldName: string,
        placeholder: string,
        zIndexVal: number
    ) => {
        // Dynamic Data Source
        let dataList: string[] = [];
        if (fieldName === 'region') {
            dataList = Object.keys(LOCATION_DATA);
        } else if (fieldName === 'municipal' && region) {
            dataList = Object.keys(LOCATION_DATA[region]?.districts || {});
        } else if (fieldName === 'ward' && region && municipal) {
            dataList = LOCATION_DATA[region]?.districts[municipal] || [];
        }

        // Filter Logic
        const filteredData = dataList.filter(item =>
            item.toLowerCase().includes(value.toLowerCase()) && item !== value
        );

        const isOpen = activeField === fieldName && filteredData.length > 0;

        const handleSelect = (item: string) => {
            setValue(item);
            setActiveField(null);
            Keyboard.dismiss();

            // ✅ SMART MAP MOVE: If Region is selected, move map!
            if (fieldName === 'region' && LOCATION_DATA[item]) {
                const newCoords = LOCATION_DATA[item].coords;
                const newRegion = {
                    ...newCoords,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setMapRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 1000);

                // Reset children
                setMunicipal('');
                setWard('');
            }
            // Reset ward if municipal changes
            if (fieldName === 'municipal') {
                setWard('');
            }
        };

        return (
            <View style={[styles.inputGroup, { zIndex: zIndexVal }]}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.autocompleteWrapper}>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={(text) => {
                            setValue(text);
                            setActiveField(fieldName);
                            if (fieldName === 'region') { setMunicipal(''); setWard(''); }
                            if (fieldName === 'municipal') { setWard(''); }
                        }}
                        onFocus={() => setActiveField(fieldName)}
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                    />

                    {isOpen && (
                        <View style={styles.suggestionsList}>
                            {filteredData.slice(0, 4).map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.suggestionItem}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                    <Text style={styles.suggestionText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setActiveField(null); }}>
            <View style={styles.container}>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={150}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.staticContent}>
                        <Text style={styles.title}>{t.onboardingStep3Title}</Text>
                        <Text style={styles.subtitle}>
                            {t.onboardingStep3MapSubtitle}
                        </Text>

                        {/* MAP SECTION */}
                        <View style={styles.mapHeader}>
                            <MapPin size={20} color="#84CC16" style={{ marginRight: 8 }} />
                            <Text style={styles.mapHeaderText}>{t.onboardingStep3CardTitle}</Text>
                        </View>

                        <View style={styles.mapContainer}>
                            <MapView
                                ref={mapRef}
                                style={styles.map}
                                region={mapRegion}
                                onPress={(e) => onLocationChange(e.nativeEvent.coordinate)}
                            >
                                <Marker
                                    coordinate={mapRegion}
                                    draggable
                                    onDragEnd={(e) => onLocationChange(e.nativeEvent.coordinate)}
                                    pinColor="#84CC16"
                                >
                                    <Callout>
                                        <Text>{t.onboardingStep3MapMarker}</Text>
                                    </Callout>
                                </Marker>
                            </MapView>
                        </View>

                        {/* FORM SECTION */}
                        <View style={styles.formContent}>

                            <View style={[styles.inputGroup, { zIndex: 1 }]}>
                                <Text style={styles.label}>{t.onboardingStep3NotesLabel}</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder={t.onboardingStep3NotesPlaceholder}
                                    value={extraInfo}
                                    onChangeText={setExtraInfo}
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    onFocus={() => setActiveField(null)}
                                />
                            </View>

                            {renderAutocomplete(t.onboardingStep3RegionLabel, region, setRegion, 'region', t.onboardingStep3RegionPlaceholder, 40)}
                            {renderAutocomplete(t.onboardingStep3MunicipalLabel, municipal, setMunicipal, 'municipal', t.onboardingStep3MunicipalPlaceholder, 30)}
                            {renderAutocomplete(t.onboardingStep3WardLabel, ward, setWard, 'ward', t.onboardingStep3WardPlaceholder, 20)}

                        </View>

                        {/* FOOTER */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                <Text style={styles.buttonTextOutline}>{t.onboardingStep1Back}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.nextButton} onPress={handleSave} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? t.onboardingStep1Saving : t.onboardingStep3Save}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#315BA9' },
    contentContainer: { flexGrow: 1, paddingBottom: 40 },
    staticContent: { paddingHorizontal: 20, paddingTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'left', fontFamily: 'Gilroy-Bold' },
    subtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'left', marginTop: 8, marginBottom: 20, paddingRight: 20 },
    mapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    mapHeaderText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    mapContainer: { height: 200, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    map: { width: '100%', height: '100%' },
    formContent: { marginBottom: 20 },
    inputGroup: { marginBottom: 20, position: 'relative' },
    autocompleteWrapper: { position: 'relative' },
    label: { fontSize: 14, fontWeight: '500', color: '#FFFFFF', marginBottom: 8, textAlign: 'left', paddingLeft: 4 },
    input: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937', fontWeight: '500' },
    textArea: { height: 60, textAlignVertical: 'center' },
    suggestionsList: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 8, marginTop: 4, paddingVertical: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, zIndex: 1000 },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    suggestionText: { fontSize: 14, color: '#1F2937' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    backButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#7EC155', borderRadius: 8, paddingVertical: 14, width: '48%', alignItems: 'center', justifyContent: 'center' },
    nextButton: { backgroundColor: '#84CC16', borderRadius: 8, paddingVertical: 14, width: '48%', alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    buttonTextOutline: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});