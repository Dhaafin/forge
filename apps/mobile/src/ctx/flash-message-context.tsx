import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  FlashMessage,
  FlashMessageOptions,
  FlashMessageType,
} from '@/components/ui/FlashMessage';

export interface FlashMessageContextType {
  showFlashMessage: (options: FlashMessageOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  hideFlashMessage: () => void;
}

const FlashMessageContext = createContext<FlashMessageContextType | undefined>(
  undefined
);

export const FlashMessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<FlashMessageOptions>({
    message: '',
    type: 'info',
  });

  const showFlashMessage = useCallback((opts: FlashMessageOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  const hideFlashMessage = useCallback(() => {
    setVisible(false);
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showFlashMessage({ message, title, type: 'success' });
    },
    [showFlashMessage]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showFlashMessage({ message, title, type: 'error' });
    },
    [showFlashMessage]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showFlashMessage({ message, title, type: 'info' });
    },
    [showFlashMessage]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showFlashMessage({ message, title, type: 'warning' });
    },
    [showFlashMessage]
  );

  return (
    <FlashMessageContext.Provider
      value={{
        showFlashMessage,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        hideFlashMessage,
      }}
    >
      {children}
      <FlashMessage
        visible={visible}
        title={options.title}
        message={options.message}
        type={options.type}
        duration={options.duration}
        onDismiss={hideFlashMessage}
      />
    </FlashMessageContext.Provider>
  );
};

export function useFlashMessage() {
  const context = useContext(FlashMessageContext);
  if (!context) {
    throw new Error('useFlashMessage must be used within a FlashMessageProvider');
  }
  return context;
}
