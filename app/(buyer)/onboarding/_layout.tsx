import { Stack } from 'expo-router';

export default function BuyerOnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="interests" />
            <Stack.Screen name="businesses" />
        </Stack>
    );
}
