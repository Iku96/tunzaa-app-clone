import { Stack } from 'expo-router';

export default function BuyerOnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="step-1-profile" />
            <Stack.Screen name="step-2-interests" />
            <Stack.Screen name="step-3-follows" />
        </Stack>
    );
}
