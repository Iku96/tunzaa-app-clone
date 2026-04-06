import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, X, ChevronDown, ChevronUp, FileText, AlertCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { uploadApi } from '../../../src/services/upload';

type DocType = 'license' | 'tin' | 'brela' | null;

export default function BusinessVerificationScreen() {
    const router = useRouter();
    const { user, submitVendorKyc } = useTunzaaAuth();
    const { t } = useLanguage();
    
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<DocType>(null);
    const [success, setSuccess] = useState(false);

    // Fetch vendor profile
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business');
    const verificationStatus = vendorProfile?.metadata?.verification_status || 'unverified';

    // State for documents
    const [licenseFile, setLicenseFile] = useState<any>(null);
    const [tinFile, setTinFile] = useState<any>(null);
    const [brelaFile, setBrelaFile] = useState<any>(null);

    const pickDocument = async (setFile: any) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.log('Error picking document:', err);
        }
    };

    const handleUpload = async () => {
        const documentsToUpload = [
            { id: 'license' as const, file: licenseFile, label: 'Business License' },
            { id: 'tin' as const, file: tinFile, label: 'TIN Certificate' },
            { id: 'brela' as const, file: brelaFile, label: 'BRELA Document' },
        ].filter(d => d.file !== null);

        if (documentsToUpload.length === 0) {
            Alert.alert('No Changes', 'Please select at least one document to upload.');
            return;
        }

        setLoading(true);
        try {
            const vendorUserId = user?.user_id || user?.id || 'unknown';
            const uploadedDocs = [];
            
            for (const doc of documentsToUpload) {
                try {
                    const uploadRes = await uploadApi.uploadFile(doc.file.uri, `${doc.id}_${vendorUserId}`);
                    uploadedDocs.push({
                        document_type_id: doc.id, // Simplified ID
                        document_url: uploadRes.url,
                        verification_status: 'pending'
                    });
                } catch (e: any) {
                    throw new Error(`Failed to upload ${doc.label}: ${e.message}`);
                }
            }

            await submitVendorKyc(uploadedDocs);
            setSuccess(true);
            setLicenseFile(null);
            setTinFile(null);
            setBrelaFile(null);
            Alert.alert('Success', 'Your documents have been submitted for approval.');
        } catch (error: any) {
            const apiError = error.response?.data?.message || error.message || 'Failed to submit documents.';
            Alert.alert('Error', apiError);
            console.error('❌ [BusinessVerification] Submission failed:', apiError);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = () => {
        const color = verificationStatus === 'verified' ? '#84CC16' : verificationStatus === 'pending' ? '#FBBF24' : '#EF4444';
        const label = verificationStatus.toUpperCase();
        return (
            <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                <Text style={[styles.statusText, { color: color }]}>{label}</Text>
            </View>
        );
    };

    const RenderAccordionItem = ({ id, label, file, setFile }: any) => {
        const isActive = activeSection === id;
        return (
            <View style={styles.accordionItem}>
                <TouchableOpacity
                    style={[styles.accordionHeader, isActive && styles.accordionHeaderActive]}
                    onPress={() => setActiveSection(isActive ? null : id)}
                >
                    <Text style={styles.accordionTitle}>{label}</Text>
                    <View style={styles.headerRight}>
                        {file && <CheckCircle size={18} color="#84CC16" style={{ marginRight: 8 }} />}
                        {isActive ? <ChevronUp size={20} color="#315BA9" /> : <ChevronDown size={20} color="#315BA9" />}
                    </View>
                </TouchableOpacity>

                {isActive && (
                    <View style={styles.accordionContent}>
                        {!file ? (
                            <TouchableOpacity style={styles.uploadBox} onPress={() => pickDocument(setFile)}>
                                <FileText size={32} color="#9CA3AF" />
                                <Text style={styles.uploadText}>{t.onboardingStep5UploadPrimary}</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.fileRow}>
                                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                <TouchableOpacity onPress={() => setFile(null)}><X size={20} color="#EF4444" /></TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Business Verification</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Account Status</Text>
                        <StatusBadge />
                    </View>
                    <Text style={styles.infoDesc}>
                        Submit your business documents to be approved for selling on the Marketplace.
                    </Text>
                </View>

                {verificationStatus === 'pending' && (
                    <View style={styles.pendingNotice}>
                        <AlertCircle size={20} color="#FBBF24" />
                        <Text style={styles.pendingText}>Your documents are currently under review.</Text>
                    </View>
                )}

                <View style={styles.docsSection}>
                    <Text style={styles.sectionTitle}>Upload Documents</Text>
                    <RenderAccordionItem id="license" label="Business License" file={licenseFile} setFile={setLicenseFile} />
                    <RenderAccordionItem id="tin" label="TIN Certificate" file={tinFile} setFile={setTinFile} />
                    <RenderAccordionItem id="brela" label="BRELA Registration" file={brelaFile} setFile={setBrelaFile} />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.disabledButton]} 
                    onPress={handleUpload}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Submit for Approval</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
    backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    scrollContent: { padding: 16 },
    infoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#315BA9' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    infoLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    infoDesc: { fontSize: 14, color: '#374151', lineHeight: 20 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    pendingNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
    pendingText: { fontSize: 14, color: '#92400E' },
    docsSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
    accordionItem: { backgroundColor: '#FFF', borderRadius: 8, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    accordionHeaderActive: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    accordionTitle: { fontSize: 15, color: '#374151', fontWeight: '500' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    accordionContent: { padding: 16, backgroundColor: '#F9FAFB' },
    uploadBox: { height: 100, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8 },
    uploadText: { fontSize: 12, color: '#6B7280' },
    fileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#84CC16' },
    fileName: { fontSize: 14, color: '#111827', flex: 1, marginRight: 8 },
    submitButton: { backgroundColor: '#315BA9', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { opacity: 0.7 }
});
