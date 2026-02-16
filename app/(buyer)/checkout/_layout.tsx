import { Stack } from 'expo-router';

export default function CheckoutLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="set-goal" />
            <Stack.Screen name="payment-method" />
            <Stack.Screen name="enter-phone" />
            <Stack.Screen name="success" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        </Stack>
    );
}
