import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import MyChatwootWidget from './RNChatwootWidget';

interface SafeChatwootWrapperProps {
  websiteToken: string;
  baseUrl: string;
  user?: any;
  launcher?: boolean;
  locale?: string;
  colorScheme?: 'light' | 'dark';
  closeModal?: () => void;
  isModalVisible?: boolean;
  customAttributes?: Record<string, any>;
}

/**
 * Safe wrapper for Chatwoot widget that handles deprecated BackHandler API
 * This fixes the "BackHandler.removeEventListener is not a function" error
 */
const SafeChatwootWrapper: React.FC<SafeChatwootWrapperProps> = (props) => {
  useEffect(() => {
    // Patch BackHandler.removeEventListener if it doesn't exist
    // This is a workaround for @chatwoot/react-native-widget using deprecated API
    const originalRemoveEventListener = BackHandler.removeEventListener;
    
    if (!BackHandler.removeEventListener) {
      // @ts-ignore - Patching deprecated method
      BackHandler.removeEventListener = (eventType: string, handler: () => boolean) => {
        // Do nothing - the new API handles cleanup via subscription.remove()
        // This prevents the error when Chatwoot tries to call the deprecated method
        console.warn(
          'BackHandler.removeEventListener is deprecated. ' +
          'The Chatwoot widget should be updated to use the new API.'
        );
      };
    }

    // Cleanup on unmount
    return () => {
      // Restore original method if it existed
      if (originalRemoveEventListener) {
        // @ts-ignore
        BackHandler.removeEventListener = originalRemoveEventListener;
      } else {
        // @ts-ignore
        delete BackHandler.removeEventListener;
      }
    };
  }, []);

  return <MyChatwootWidget {...props} />;
};

export default SafeChatwootWrapper;

