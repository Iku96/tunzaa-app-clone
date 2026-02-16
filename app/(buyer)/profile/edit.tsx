import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/contexts/AuthContext';
import ProfileSetupBanner from '../../../src/components/profile/ProfileSetupBanner';

export default function EditProfileScreen() {
    const router = useRouter();
    const { profile } = useAuth();

    const [name, setName] = useState(profile?.full_name || 'Fredrick John');
    const [username, setUsername] = useState(profile?.username || 'FredrickJr');
    const [email, setEmail] = useState(profile?.email || 'frejohn2025@gmail.com');
    const [phone, setPhone] = useState(profile?.phone_number || '0750 693 252');
    const [dob, setDob] = useState('18/March/1997');
    const [gender, setGender] = useState('');

    const handleSave = () => {
        // Implement save logic here
        Alert.alert('Success', 'Profile updated successfully!');
        router.back();
    };

    const renderInput = (label: string, value: string, setValue: (text: string) => void, icon?: string, isEditable: boolean = true) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    editable={isEditable}
                    placeholder={`Enter ${label}`}
                />
                <TouchableOpacity>
                    <Ionicons name={icon || "pencil"} size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit business profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
                    <Ionicons name="checkmark" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Image */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${name}&background=eff6ff&color=425ba4` }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.cameraButton}>
                            <Ionicons name="camera" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Banner */}
                <ProfileSetupBanner progress={0.5} points={50} />

                {/* Form */}
                <View style={styles.form}>
                    {renderInput('Name', name, setName, 'pencil')}
                    {renderInput('Username', username, setUsername, 'pencil')}

                    {/* Date of Birth - Custom Row */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date of birth</Text>
                        <TouchableOpacity style={styles.inputWrapper}>
                            <Text style={styles.inputValue}>{dob}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {renderInput('Email address', email, setEmail, 'pencil')}
                    {renderInput('Phone number', phone, setPhone, 'pencil')}

                    {/* Gender - Custom Row */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Gender</Text>
                        <TouchableOpacity style={styles.inputWrapper}>
                            <Text style={[styles.inputValue, !gender && styles.placeholder]}>
                                {gender || 'Choose gender'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1E3A8A', // Dark blue
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    form: {
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    inputValue: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    placeholder: {
        color: '#9CA3AF',
        fontWeight: 'normal',
    },
});
