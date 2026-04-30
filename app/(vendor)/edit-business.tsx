import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Camera, 
    Check, 
    ChevronDown,
    Building2,
    MapPin,
    Hash,
    Tag
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useCategories } from '@/src/services/categories';
import { CategorySelector } from '@/components/vendor/CategorySelector';
import { Input } from '@/components/ui/input';

export default function EditBusinessScreen() {
    const router = useRouter();
    const { user, updateVendor } = useTunzaaAuth();
    const { data: categoriesData } = useCategories();
    
    // Find vendor profile
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business');
    const metadata = vendorProfile?.metadata || {};
    
    // Form State
    const [businessName, setBusinessName] = useState(metadata?.business_name || '');
    const [logo, setLogo] = useState(metadata?.logo_url || metadata?.image_url || null);
    const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
    const [region, setRegion] = useState(metadata?.region || '');
    const [municipal, setMunicipal] = useState(metadata?.municipal || '');
    const [ward, setWard] = useState(metadata?.ward || '');
    const [tin, setTin] = useState(metadata?.tax_id || '');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Load initial categories
    useEffect(() => {
        if (metadata?.categories && Array.isArray(metadata.categories)) {
            setSelectedCategories(metadata.categories);
        }
    }, [metadata]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setLogo(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!businessName.trim()) {
            Alert.alert('Error', 'Business name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const vendorId = metadata?.vendor_id || vendorProfile?.profile_id;
            const profileId = vendorProfile?.profile_id;

            if (!vendorId || !profileId) {
                throw new Error('Profile details missing');
            }

            const updateData = {
                business_name: businessName,
                display_name: businessName,
                tax_id: tin,
                region,
                municipal,
                ward,
                categories: selectedCategories,
                logo_url: logo, // In real app, upload logo first
                location: {
                    region,
                    ward,
                    municipal
                }
            };

            await updateVendor(vendorId, profileId, updateData);
            
            Alert.alert('Success', 'Business profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Update failed:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Business</Text>
                <TouchableOpacity 
                    onPress={handleSave} 
                    disabled={isSubmitting}
                    style={styles.saveBtn}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#3A5BA9" />
                    ) : (
                        <Check size={24} color="#3A5BA9" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.logoContainer}>
                        {logo ? (
                            <Image source={{ uri: logo }} style={styles.logoImage} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <Building2 size={40} color="#9CA3AF" />
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Camera size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.logoLabel}>Business Logo</Text>
                </View>

                {/* Form Sections */}
                <View style={styles.form}>
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Building2 size={18} color="#3A5BA9" />
                            <Text style={styles.sectionTitle}>Business Details</Text>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Business Name</Text>
                            <Input 
                                value={businessName}
                                onChangeText={setBusinessName}
                                placeholder="e.g. Acme Corporation"
                                className="bg-gray-50 border-gray-200"
                            />
                        </View>
                    </View>

                    {/* Category Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Tag size={18} color="#3A5BA9" />
                            <Text style={styles.sectionTitle}>Categories</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.selector}
                            onPress={() => setShowCategoryModal(!showCategoryModal)}
                        >
                            <Text style={styles.selectorText}>
                                {selectedCategories.length > 0 
                                    ? `${selectedCategories.length} Categories Selected`
                                    : 'Select business categories'}
                            </Text>
                            <ChevronDown size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        
                        {showCategoryModal && (
                            <View style={styles.categoryContainer}>
                                <CategorySelector 
                                    categories={categoriesData?.items || []}
                                    selectedCategories={selectedCategories}
                                    onCategoryChange={setSelectedCategories}
                                />
                            </View>
                        )}
                    </View>

                    {/* Location Stack */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MapPin size={18} color="#3A5BA9" />
                            <Text style={styles.sectionTitle}>Location</Text>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Region (Mkoa)</Text>
                                <Input 
                                    value={region}
                                    onChangeText={setRegion}
                                    placeholder="e.g. Dar es Salaam"
                                    className="bg-gray-50 border-gray-200"
                                />
                            </View>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Municipal (Wilaya)</Text>
                                <Input 
                                    value={municipal}
                                    onChangeText={setMunicipal}
                                    placeholder="e.g. Kinondoni"
                                    className="bg-gray-50 border-gray-200"
                                />
                            </View>
                            <View style={{ width: 12 }} />
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Ward (Kata)</Text>
                                <Input 
                                    value={ward}
                                    onChangeText={setWard}
                                    placeholder="e.g. Msasani"
                                    className="bg-gray-50 border-gray-200"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Tax Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Hash size={18} color="#3A5BA9" />
                            <Text style={styles.sectionTitle}>Tax & Compliance</Text>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>TIN Number</Text>
                            <Input 
                                value={tin}
                                onChangeText={setTin}
                                placeholder="Enter 9-digit TIN"
                                keyboardType="numeric"
                                maxLength={9}
                                className="bg-gray-50 border-gray-200"
                            />
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    saveBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    logoSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    logoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3A5BA9',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    logoLabel: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#3A5BA9',
    },
    form: {
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    selectorText: {
        fontSize: 14,
        color: '#111827',
    },
    categoryContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    }
});
