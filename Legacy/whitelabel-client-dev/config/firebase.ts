import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";

// Firebase is automatically initialized with the config files
// (google-services.json for Android and GoogleService-Info.plist for iOS)

// Get the Firebase Auth instance
const firebaseAuth = auth();

export { firebase, firebaseAuth as auth };
