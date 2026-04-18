import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@tunzaa_onboarding_cache';

export const saveOnboardingStep = async (stepId: string, data: any) => {
    try {
        const existingRaw = await AsyncStorage.getItem(ONBOARDING_KEY);
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        const updated = { ...existing, [stepId]: data, lastStep: stepId };
        await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) { 
        console.error('Onboarding cache error:', e); 
        return null;
    }
};

export const getOnboardingCache = async () => {
    try {
        const existingRaw = await AsyncStorage.getItem(ONBOARDING_KEY);
        return existingRaw ? JSON.parse(existingRaw) : null;
    } catch (e) { 
        return null; 
    }
};

export const clearOnboardingCache = async () => {
    try { 
        await AsyncStorage.removeItem(ONBOARDING_KEY); 
    } catch (e) {}
};
