import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTunzaaAuth } from '../contexts/TunzaaAuthContext';

const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

export interface CompletionField {
    key: string;
    label: string;
    filled: boolean;
}

export function useProfileCompletion() {
    const { user } = useTunzaaAuth();
    const [localExtras, setLocalExtras] = useState<Record<string, any>>({});

    useEffect(() => {
        const loadLocalExtras = async () => {
            const userId = user?.user_id || user?.id;
            if (userId) {
                const stored = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${userId}`);
                if (stored) {
                    try {
                        setLocalExtras(JSON.parse(stored));
                    } catch (e) {
                        console.warn('[useProfileCompletion] Failed to parse local extras');
                    }
                }
            }
        };
        loadLocalExtras();
    }, [user]);

    // 1. Get metadata from top level
    let topMeta: Record<string, any> = {};
    if (user?.metadata) {
        topMeta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
    }

    // 2. Get metadata from buyer profile
    const buyerProfile = user?.profiles?.find((p: any) => p.role.toLowerCase() === 'buyer');
    let profileMeta: Record<string, any> = {};
    if (buyerProfile?.metadata) {
        profileMeta = typeof buyerProfile.metadata === 'string' ? JSON.parse(buyerProfile.metadata) : buyerProfile.metadata;
    }

    // 3. Merge: Local Extras (AsyncStorage) takes priority for immediate feedback
    const metadata = { ...topMeta, ...profileMeta, ...localExtras };
    
    // 4. Robust value finder
    const getValue = (key: string, topLevelVal?: any) => {
        return !!(topLevelVal || metadata[key] || (user as any)[key] || (buyerProfile as any)?.[key]);
    };

    const fields: CompletionField[] = [
        { key: 'first_name', label: 'First Name', filled: !!user?.first_name },
        { key: 'last_name', label: 'Last Name', filled: !!user?.last_name },
        { key: 'phone_number', label: 'Phone Number', filled: !!user?.phone_number },
        { key: 'username', label: 'Username', filled: getValue('username') },
        { key: 'gender', label: 'Gender', filled: getValue('gender') },
        { key: 'date_of_birth', label: 'Date of Birth', filled: getValue('date_of_birth') || getValue('dob') },
        { key: 'profile_picture', label: 'Profile Picture', filled: getValue('profile_picture') || getValue('avatar_url') || getValue('image_url') },
        { key: 'is_verified', label: 'ID Verification', filled: !!user?.is_verified },
    ];

    // Email is optional for completion if phone is present, but we still track it
    const hasEmail = !!user?.email;
    if (hasEmail) {
        // If they have email, we don't need to add it to fields because we want 100% to be achievable without it 
        // if they don't want to provide it. But if they DO provide it, it's just extra.
    }

    const filledCount = fields.filter(f => f.filled).length;
    const percentage = Math.round((filledCount / fields.length) * 100);
    const missingFields = fields.filter(f => !f.filled);

    return {
        percentage,
        filledCount,
        totalCount: fields.length,
        missingFields,
        isComplete: percentage === 100
    };
}
