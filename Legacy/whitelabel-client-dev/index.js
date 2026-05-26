import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { registerBackgroundHandler } from './services/background-messaging';

// Register Firebase background message handler
registerBackgroundHandler();

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
