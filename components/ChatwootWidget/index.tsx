import React, { Component } from "react";

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble: boolean;
      position: "left" | "right";
      locale: string;
      type: "standard" | "expanded_bubble";
    };
    chatwootSDK?: {
      run: (options: { websiteToken: string; baseUrl: string }) => void;
      setUser?: (
        identifier: string,
        user: {
          name?: string;
          email?: string;
          avatar_url?: string;
          phone_number?: string;
          identifier_hash?: string;
        }
      ) => void;
      toggle?: (state?: "open" | "close") => void;
      setCustomAttributes?: (attributes: Record<string, any>) => void;
      setConversationCustomAttributes?: (attributes: Record<string, any>) => void;
    };
    $chatwoot?: {
      toggle: (state?: "open" | "close") => void;
      setCustomAttributes: (attributes: Record<string, any>) => void;
      setUser: (identifier: string, user: Record<string, any>) => void;
    };
  }
}

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone_number?: string;
  [key: string]: any;
}

interface ChatwootWidgetProps {
  user: any;
  conversationId?: string; // New prop to open specific conversation
  onWidgetReady?: () => void;
}

class ChatwootWidget extends Component<ChatwootWidgetProps> {
  private isScriptLoaded = false;

  componentDidMount(): void {
    this.initializeChatwoot();
  }

  componentDidUpdate(prevProps: ChatwootWidgetProps): void {
    // If conversationId changes, open the widget with that conversation
    if (
      this.props.conversationId &&
      this.props.conversationId !== prevProps.conversationId &&
      this.isScriptLoaded
    ) {
      this.openConversation(this.props.conversationId);
    }
  }

  initializeChatwoot = (): void => {
    const { user, conversationId, onWidgetReady } = this.props;

    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      locale: "en",
      type: "standard",
    };

    // Capture 'this' context before IIFE
    const self = this;

    (function (d: Document, t: "script") {
      const BASE_URL = "https://support.afrizon.africa";
      const g: HTMLScriptElement = d.createElement(t);
      const s = d.getElementsByTagName(t)[0];
      g.src = `${BASE_URL}/packs/js/sdk.js`;
      g.defer = true;
      g.async = true;
      g.onload = () => {
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: "jn5LtxocshE4YWqTSdTMTWVS",
            baseUrl: BASE_URL,
          });

          // Set user information
          window.chatwootSDK.setUser?.(user.id, {
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
          });

          // Use captured 'self' reference
          self.isScriptLoaded = true;

          // Notify parent component that widget is ready
          onWidgetReady?.();

          // If conversationId is provided on mount, open it
          if (conversationId) {
            // Wait a bit for the widget to fully initialize
            setTimeout(() => {
              self.openConversation(conversationId);
            }, 1000);
          }
        }
      };
      s.parentNode?.insertBefore(g, s);
    })(document, "script");
  };

  openConversation = (conversationId: string): void => {
    // Set custom attributes to load specific conversation
    if (window.$chatwoot) {
      // Open the widget
      window.$chatwoot.toggle("open");

      // Set custom attributes to identify the conversation
      window.$chatwoot.setCustomAttributes({
        conversation_id: conversationId,
        source: "support_ticket",
      });
    } else if (window.chatwootSDK) {
      // Fallback to SDK methods
      window.chatwootSDK.toggle?.("open");
      window.chatwootSDK.setCustomAttributes?.({
        conversation_id: conversationId,
        source: "support_ticket",
      });
    }
  };

  render(): null {
    return null;
  }
}

export default ChatwootWidget;