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
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Check, 
    Pencil, 
    ChevronDown, 
    UploadCloud,
    Eye,
    Trash2,
    Plus,
    FileText
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useCategories } from '@/src/services/categories';
import { CategorySelector } from '@/components/vendor/CategorySelector';

const { width } = Dimensions.get('window');

export default function EditBusinessScreen() {
    const router = useRouter();
    const { user, updateVendor } = useTunzaaAuth();
    const { data: categoriesData } = useCategories();
    
    // Find vendor profile
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business');
    const metadata = vendorProfile?.metadata || {};
    
    // Form State
    const [businessName, setBusinessName] = useState(metadata?.business_name || '');
    const [email, setEmail] = useState(metadata?.contact_email || user?.email || '');
    const [phone, setPhone] = useState(metadata?.contact_phone || user?.phone_number || '');
    const [logo, setLogo] = useState(metadata?.logo_url || metadata?.image_url || null);
    const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
    const [tin, setTin] = useState(metadata?.tax_id || '');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Documents from metadata
    const verificationDocs = metadata?.verification_documents || [];

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

            const updateData = {
                business_name: businessName,
                display_name: businessName,
                contact_email: email,
                contact_phone: phone,
                tax_id: tin,
                categories: selectedCategories,
                logo_url: logo,
            };

            await updateVendor(vendorId, profileId, updateData);
            Alert.alert('Success', 'Business profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCard = (label: string, value: string, icon?: React.ReactNode, onPress?: () => void) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={styles.cardValue}>{value || `Enter ${label.toLowerCase()}`}</Text>
            </View>
            {icon && <View style={styles.cardIcon}>{icon}</View>}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit business profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={isSubmitting} style={styles.headerBtn}>
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#111827" />
                    ) : (
                        <Check size={24} color="#111827" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.logoWrapper}>
                        <View style={styles.logoContainer}>
                            {logo ? (
                                <Image source={{ uri: logo }} style={styles.logoImage} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Text style={styles.logoInitials}>
                                        {businessName?.substring(0, 2).toUpperCase() || 'BZ'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.logoBadge}>
                            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Business Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business details</Text>
                    
                    {renderCard('Business name', businessName)}
                    {renderCard('Email address', email, <Pencil size={18} color="#111827" />)}
                    {renderCard('Phone number', phone, <Pencil size={18} color="#111827" />)}
                    {renderCard(
                        'Category', 
                        selectedCategories.length > 0 ? selectedCategories[0].name : 'Select Category', 
                        <ChevronDown size={20} color="#111827" />,
                        () => setShowCategoryModal(!showCategoryModal)
                    )}

                    {showCategoryModal && (
                        <View style={styles.categoryPickerContainer}>
                            <CategorySelector 
                                categories={categoriesData?.items || []}
                                selectedCategories={selectedCategories}
                                onCategoryChange={(cats) => {
                                    setSelectedCategories(cats);
                                    if (cats.length > 0) setShowCategoryModal(false);
                                }}
                            />
                        </View>
                    )}
                </View>

                {/* Certificate / Compliance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certificate / compliance</Text>
                    <Text style={styles.sectionSubtitle}>upload or updated verification file</Text>
                    
                    <TouchableOpacity style={styles.uploadArea}>
                        <UploadCloud size={32} color="#425BA4" />
                        <View style={styles.uploadBtn}>
                            <Text style={styles.uploadBtnText}>Upload file</Text>
                        </View>
                        <Text style={styles.uploadFormats}>Choose PDF, PNG, JPG</Text>
                    </TouchableOpacity>

                    {/* Document List */}
                    <View style={styles.docList}>
                        {verificationDocs.map((doc: any, index: number) => (
                            <View key={index} style={styles.docItem}>
                                <View style={styles.docIconContainer}>
                                    <FileText size={20} color="#EF4444" />
                                </View>
                                <View style={styles.docInfo}>
                                    <Text style={styles.docName}>{doc.document_type_name || 'Certificate'}</Text>
                                    <Text style={styles.docMeta}>
                                        Uploaded {new Date(doc.submitted_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.docActions}>
                                    <TouchableOpacity style={styles.docActionBtn}>
                                        <Eye size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.docActionBtn}>
                                        <Trash2 size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
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
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    logoSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    logoWrapper: {
        position: 'relative',
    },
    logoContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoInitials: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3A5BA9',
    },
    logoBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#3A5BA9',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: -12,
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    cardIcon: {
        marginLeft: 12,
    },
    categoryPickerContainer: {
        marginBottom: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    uploadArea: {
        height: 160,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginBottom: 20,
    },
    uploadBtn: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    uploadBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    uploadFormats: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    docList: {
        gap: 12,
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    docIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    docInfo: {
        flex: 1,
    },
    docName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    docMeta: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    docActions: {
        flexDirection: 'row',
        gap: 8,
    },
    docActionBtn: {
        padding: 6,
    }
});
