import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MapPin } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeliveryStepper from '../../src/components/delivery/DeliveryStepper';

// ✅ STATIC DATA 
const LOCATION_DATA: any = {
    'Dar es Salaam': {
        districts: {
            'Ilala': ['Kivukoni', 'Upanga Mashariki', 'Kisutu', 'Jangwani'],
            'Kinondoni': ['Magomeni', 'Kijitonyama', 'Hananasif', 'Mwananyamala'],
            'Ubungo': ['Ubungo', 'Kibamba', 'Mbezi', 'Manzese'],
            'Temeke': ['Temeke', 'Kurasini', 'Chang’ombe', 'Mtoni'],
            'Kigamboni': ['Kigamboni', 'Tungi', 'Vijibweni', 'Mjimwema']
        }
    },
    'Arusha': {
        districts: {
            'Arusha City': ['Sekei', 'Kaloleni', 'Themi', 'Lemara', 'Kimandolu'],
            'Meru': ['Akheri', 'Majiyachai', 'Usa River', 'Leguruki'],
            'Monduli': ['Monduli mjini', 'Engutoto', 'Moita']
        }
    },
    'Dodoma': {
        districts: {
            'Dodoma Urban': ['Kikuyu', 'Makole', 'Madukani', 'Majengo'],
            'Bahi': ['Bahi', 'Lamaiti'],
            'Kondoa': ['Kondoa Mjini']
        }
    }
};

export default function DeliveryLocationManual() {
    const router = useRouter();

    const [region, setRegion] = useState('');
    const [municipal, setMunicipal] = useState('');
    const [ward, setWard] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const [activeField, setActiveField] = useState<string | null>(null);

    const handleSave = async () => {
        if (!region || !municipal || !ward) {
            alert("Tafadhali chagua Mkoa, Wilaya na Kata.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // ✅ PASS DATA TO SUMMARY
            router.push({
                pathname: '/(delivery)/delivery-location-summary',
                params: {
                    region,
                    municipal,
                    ward,
                    extraInfo
                }
            });
        }, 1000);
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
        let dataList: string[] = [];
        if (fieldName === 'region') {
            dataList = Object.keys(LOCATION_DATA);
        } else if (fieldName === 'municipal' && region) {
            dataList = Object.keys(LOCATION_DATA[region]?.districts || {});
        } else if (fieldName === 'ward' && region && municipal) {
            dataList = LOCATION_DATA[region]?.districts[municipal] || [];
        }

        const filteredData = dataList.filter(item =>
            item.toLowerCase().includes(value.toLowerCase()) && item !== value
        );

        const isOpen = activeField === fieldName && filteredData.length > 0;

        const handleSelect = (item: string) => {
            setValue(item);
            setActiveField(null);
            Keyboard.dismiss();

            if (fieldName === 'region') {
                setMunicipal('');
                setWard('');
            }
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
            <SafeAreaView style={styles.container} edges={['top']}>
                <DeliveryStepper currentStep={1} />
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={100}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.staticContent}>
                        <Text style={styles.title}>Eneo La Kampuni</Text>
                        <Text style={styles.subtitle}>
                            Buruta pini kwenye ramani kuchagua eneo sahihi la kampuni yako.
                        </Text>

                        {/* FORM HEADER */}
                        <View style={styles.mapHeader}>
                            <MapPin size={20} color="#84CC16" style={{ marginRight: 8 }} />
                            <Text style={styles.mapHeaderText}>Weka eneo la kampuni</Text>
                        </View>

                        {/* FORM CONTENT */}
                        <View style={styles.formContent}>

                            {renderAutocomplete("Mkoa", region, setRegion, 'region', "Mfano: Dar es Salaam", 40)}
                            {renderAutocomplete("Wilaya", municipal, setMunicipal, 'municipal', "Mfano: Kinondoni", 30)}
                            {renderAutocomplete("Kata", ward, setWard, 'ward', "Mfano: Kijitonyama", 20)}

                            <View style={[styles.inputGroup, { zIndex: 1 }]}>
                                <Text style={styles.label}>Maelezo ya ziada</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Maelezo ya ziada"
                                    value={extraInfo}
                                    onChangeText={setExtraInfo}
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    onFocus={() => setActiveField(null)}
                                />
                            </View>

                        </View>

                        {/* FOOTER */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                <Text style={styles.buttonTextOutline}>Rudi</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.nextButton} onPress={handleSave} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Inahifadhi...' : 'Hifadhi'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#425BA4' },
    contentContainer: { flexGrow: 1, paddingBottom: 40 },
    staticContent: { paddingHorizontal: 20, paddingTop: 0 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'left', fontFamily: 'Gilroy-Bold' },
    subtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'left', marginTop: 8, marginBottom: 20, paddingRight: 20 },
    mapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    mapHeaderText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
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
