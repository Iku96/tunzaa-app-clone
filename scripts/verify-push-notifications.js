#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Firebase Push Notifications Setup...\n');

// Check if required files exist
const requiredFiles = [
  'config/google-services.json',
  'config/GoogleService-Info.plist',
  'services/push-notifications.ts',
  'services/background-messaging.ts',
  'hooks/usePushNotifications.ts',
  'components/notifications/PushNotificationsProvider.tsx'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@react-native-firebase/app',
  '@react-native-firebase/messaging'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - NOT INSTALLED`);
  }
});

// Check app.json configuration
console.log('\n⚙️ Checking app.json configuration...');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

// Check iOS configuration
console.log('\n📱 iOS Configuration:');
const iosConfig = appJson.expo.ios;
if (iosConfig) {
  console.log(`✅ iOS bundle ID: ${iosConfig.bundleIdentifier}`);
  console.log(`✅ Google Services file: ${iosConfig.googleServicesFile}`);
  
  if (iosConfig.entitlements && iosConfig.entitlements['aps-environment']) {
    console.log(`✅ APS Environment: ${iosConfig.entitlements['aps-environment']}`);
  } else {
    console.log('❌ APS Environment not configured');
  }
  
  if (iosConfig.infoPlist && iosConfig.infoPlist.UIBackgroundModes) {
    console.log(`✅ Background modes: ${iosConfig.infoPlist.UIBackgroundModes.join(', ')}`);
  } else {
    console.log('❌ Background modes not configured');
  }
  
  if (iosConfig.infoPlist && iosConfig.infoPlist.NSUserNotificationUsageDescription) {
    console.log('✅ Notification usage description configured');
  } else {
    console.log('❌ Notification usage description missing');
  }
} else {
  console.log('❌ iOS configuration missing');
}

// Check Android configuration
console.log('\n🤖 Android Configuration:');
const androidConfig = appJson.expo.android;
if (androidConfig) {
  console.log(`✅ Android package: ${androidConfig.package}`);
  console.log(`✅ Google Services file: ${androidConfig.googleServicesFile}`);
  
  if (androidConfig.permissions) {
    const notificationPermissions = [
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK',
      'com.google.android.c2dm.permission.RECEIVE'
    ];
    
    notificationPermissions.forEach(permission => {
      if (androidConfig.permissions.includes(permission)) {
        console.log(`✅ ${permission}`);
      } else {
        console.log(`❌ ${permission} - MISSING`);
      }
    });
  } else {
    console.log('❌ Android permissions not configured');
  }
} else {
  console.log('❌ Android configuration missing');
}

// Check plugins
console.log('\n🔌 Checking plugins...');
const plugins = appJson.expo.plugins;
if (plugins) {
  const hasFirebaseApp = plugins.some(plugin => 
    Array.isArray(plugin) && plugin[0] === '@react-native-firebase/app'
  );
  const hasFirebaseMessaging = plugins.some(plugin => 
    Array.isArray(plugin) && plugin[0] === '@react-native-firebase/messaging'
  );
  
  console.log(`${hasFirebaseApp ? '✅' : '❌'} @react-native-firebase/app plugin`);
  console.log(`${hasFirebaseMessaging ? '✅' : '❌'} @react-native-firebase/messaging plugin`);
} else {
  console.log('❌ No plugins configured');
}

// Check if background handler is registered
console.log('\n🔄 Checking background handler registration...');
const indexJs = fs.readFileSync('index.js', 'utf8');
if (indexJs.includes('registerBackgroundHandler')) {
  console.log('✅ Background handler registered in index.js');
} else {
  console.log('❌ Background handler not registered in index.js');
}

// Check if provider is integrated
console.log('\n🏗️ Checking provider integration...');
const layoutFile = fs.readFileSync('app/_layout.tsx', 'utf8');
if (layoutFile.includes('PushNotificationsProvider')) {
  console.log('✅ PushNotificationsProvider integrated in app layout');
} else {
  console.log('❌ PushNotificationsProvider not integrated in app layout');
}

console.log('\n✨ Verification completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: expo run:ios or expo run:android');
console.log('2. Check console logs for Firebase messaging initialization');
console.log('3. Test notification permissions when logged in');
console.log('4. Send test notifications from Firebase Console');
console.log('5. Verify deep linking navigation works correctly'); 