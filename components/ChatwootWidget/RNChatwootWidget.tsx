import React from 'react';
import ChatWootWidget from '@chatwoot/react-native-widget';

interface User {
  identifier: string;
  name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
}

interface MyChatwootWidgetProps {
  websiteToken: string;
  baseUrl: string;
  user?: any;
  launcher?: boolean;        // show/hide floating bubble
  locale?: string;           // language
  colorScheme?: 'light' | 'dark';
  closeModal?: () => void;   // callback when modal is closed
  isModalVisible?: boolean;  // control modal visibility
  customAttributes?: Record<string, any>; // custom attributes to pass to Chatwoot
}

const MyChatwootWidget: React.FC<MyChatwootWidgetProps> = ({
  websiteToken,
  baseUrl,
  user,
  launcher = true,
  locale = 'en',
  colorScheme = 'light',
  closeModal = () => {},
  isModalVisible = false,
  customAttributes,
}) => {
  return (
    <ChatWootWidget
          websiteToken={websiteToken}
          baseUrl={baseUrl}
          user={user}
          locale={locale}
          colorScheme={colorScheme} 
          closeModal={closeModal} 
          isModalVisible={isModalVisible}
          customAttributes={customAttributes}
          />
  );
};

export default MyChatwootWidget;
