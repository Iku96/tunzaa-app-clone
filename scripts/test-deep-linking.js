#!/usr/bin/env node

/**
 * Deep Linking Test Script
 * 
 * This script helps test deep linking functionality by generating test URLs
 * and providing instructions for testing.
 */

const testUrls = [
  'https://afrizon.cheetah.co.tz/order/ORD-20250705-JDRGL',
  'myapp://order/ORD-20250705-JDRGL',
  'https://afrizon.cheetah.co.tz/order/12345',
  'myapp://order/12345'
];

console.log('🔗 Deep Linking Test URLs\n');

testUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

console.log('\n📱 Testing Instructions:\n');

console.log('iOS Simulator:');
console.log('1. Open Safari in iOS Simulator');
console.log('2. Navigate to: https://afrizon.cheetah.co.tz/order/ORD-20250705-JDRGL');
console.log('3. The app should open automatically if installed');
console.log('');

console.log('Android Emulator:');
console.log('1. Open Chrome in Android Emulator');
console.log('2. Navigate to: https://afrizon.cheetah.co.tz/order/ORD-20250705-JDRGL');
console.log('3. The app should open automatically if installed');
console.log('');

console.log('Physical Device:');
console.log('1. Send one of the URLs via email, SMS, or messaging app');
console.log('2. Tap the link on your device');
console.log('3. The app should open to the order details page');
console.log('');

console.log('Development Testing:');
console.log('1. Add the DeepLinkTest component to any screen');
console.log('2. Use the test buttons to verify functionality');
console.log('3. Check console logs for debugging information');
console.log('');

console.log('🔧 Troubleshooting:');
console.log('- Ensure expo-linking is properly configured in app.json');
console.log('- Verify that the useDeepLinking hook is initialized in _layout.tsx');
console.log('- Check that all route files exist and are properly structured');
console.log('- Test with both authenticated and non-authenticated users');
console.log('');

console.log('📋 Expected Behavior:');
console.log('- Authenticated users: Navigate to /(buyer)/orders/[id]');
console.log('- Non-authenticated users: Navigate to /(public)/order/[id]');
console.log('- Both should display order details with appropriate functionality');
console.log('- Share button should generate the correct URL format'); 