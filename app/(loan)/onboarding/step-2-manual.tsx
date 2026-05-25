import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// STATIC LOCATION DATA 
const LOCATION_DATA: any = {
    'Dar es Salaam': {
        'Ilala': ['Kivukoni', 'Upanga Mashariki', 'Upanga Magharibi', 'Kisutu', 'Jangwani'],
        'Kinondoni': ['Magomeni', 'Ndugumbi', 'Kijitonyama', 'Hananasif', 'Mwananyamala'],
        'Ubungo': ['Ubungo', 'Kibamba', 'Mbezi', 'Manzese', 'Mabibo'],
        'Temeke': ['Temeke', 'Kurasini', 'Chang’ombe', 'Mtoni', 'Sandali'],
        'Kigamboni': ['Kigamboni', 'Tungi', 'Vijibweni', 'Mjimwema']
    },
    'Arusha': {
        'Arusha City': ['Sekei', 'Kaloleni', 'Themi', 'Lemara', 'Kimandolu'],
        'Meru': ['Akheri', 'Majiyachai', 'Usa River', 'Leguruki'],
        'Monduli': ['Monduli mjini', 'Engutoto', 'Moita']
    },
    'Dodoma': {
        'Dodoma Urban': ['Kikuyu', 'Makole', 'Madukani', 'Majengo', 'Viwandani'],
        'Bahi': ['Bahi', 'Lamaiti', 'Mwitikira'],
        'Kondoa': ['Kondoa Mjini', 'Soera', 'Bumbuta']
    }
};

export default function LoanStep2Manual() {
    const router = useRouter();

    // Form State
    const [region, setRegion] = useState('');
    const [municipal, setMunicipal] = useState('');
    const [ward, setWard] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const [activeField, setActiveField] = useState<string | null>(null);

    const handleSave = async () => {
        if (!region || !municipal || !ward) {
            alert('Tafadhali kamilisha eneo lako (Mkoa, Wilaya, Kata).');
            return;
        }

        setLoading(true);
        try {
            await AsyncStorage.setItem('TEMP_ONBOARDING_LOCATION', JSON.stringify({
                region,
                municipal,
                ward,
                extraInfo
            }));
            
            router.push('/(loan)/onboarding/step-3');
        } catch (e) {
            console.error('❌ [Loan Step2] Save failed:', e);
        } finally {
            setLoading(false);
        }
    };

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
            dataList = Object.keys(LOCATION_DATA[region] || {});
        } else if (fieldName === 'ward' && region && municipal) {
            dataList = LOCATION_DATA[region][municipal] || [];
        }

        const filteredData = dataList.filter(item =>
            item.toLowerCase().includes(value.toLowerCase()) && item !== value
        );

        const isOpen = activeField === fieldName && filteredData.length > 0;

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
                            {filteredData.slice(0, 5).map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        setValue(item);
                                        setActiveField(null);
                                        Keyboard.dismiss();
                                    }}
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
                    extraScrollHeight={100}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.staticContent}>
                        <Text style={styles.title}>Eneo La Kampuni</Text>
                        <Text style={styles.subtitle}>
                            Wezesha wateja kufata huduma kwa urahisi kwa kuweka eneo la Kampuni yako.
                        </Text>

                        <View style={styles.formContent}>
                            {renderAutocomplete('Mkoa', region, setRegion, 'region', 'Arusha', 40)}
                            {renderAutocomplete('Wilaya', municipal, setMunicipal, 'municipal', 'Arusha Urban', 30)}
                            {renderAutocomplete('Kata', ward, setWard, 'ward', 'Kimandolu', 20)}

                            <View style={[styles.inputGroup, { zIndex: 1 }]}>
                                <Text style={styles.label}>Maelezo ya ziada</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Maelezo ya ziada"
                                    value={extraInfo}
                                    onChangeText={setExtraInfo}
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    onFocus={() => setActiveField(null)}
                                />
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                <Text style={styles.buttonTextWhite}>Rudi</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.nextButton} onPress={handleSave} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Inahifadhi...' : 'Hifadhi'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#425BA4' },
    contentContainer: { flexGrow: 1, paddingBottom: 40 },
    staticContent: { paddingHorizontal: 20, paddingTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'left', fontFamily: 'Gilroy-Bold' },
    subtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'left', marginTop: 8, marginBottom: 30, lineHeight: 20 },
    formContent: { marginBottom: 20 },
    inputGroup: { marginBottom: 20, position: 'relative' },
    autocompleteWrapper: { position: 'relative' },
    label: { fontSize: 14, fontWeight: '500', color: '#FFFFFF', marginBottom: 8, paddingLeft: 4 },
    input: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937', fontWeight: '500' },
    textArea: { height: 80 },
    suggestionsList: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 8, marginTop: 4, paddingVertical: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, zIndex: 1000 },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    suggestionText: { fontSize: 14, color: '#1F2937' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, zIndex: 0 },
    backButton: { width: '48%', height: 53, borderRadius: 8, borderWidth: 1, borderColor: '#7EC155', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
    nextButton: { width: '48%', height: 53, backgroundColor: '#84CC16', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    buttonTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
