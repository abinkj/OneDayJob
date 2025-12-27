import React, { createContext, useContext, useState, useCallback } from "react";
import CustomAlert, { AlertConfig } from "./index";

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    // Clear config after animation completes
    setTimeout(() => setAlertConfig(null), 200);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <CustomAlert visible={visible} onDismiss={hideAlert} {...alertConfig} />
      )}
    </AlertContext.Provider>
  );
};

// Convenience class for imperative API (similar to Alert.alert)
class CustomAlertManager {
  private static showAlertCallback: ((config: AlertConfig) => void) | null =
    null;

  static setShowAlertCallback(callback: (config: AlertConfig) => void) {
    this.showAlertCallback = callback;
  }

  static show(
    title: string,
    message: string,
    buttons?: AlertConfig["buttons"],
    options?: { type?: AlertConfig["type"]; dismissable?: boolean }
  ) {
    if (this.showAlertCallback) {
      this.showAlertCallback({
        title,
        message,
        buttons,
        type: options?.type || "info",
        dismissable: options?.dismissable ?? false,
      });
    } else {
      console.warn(
        "CustomAlert not initialized. Make sure AlertProvider is in your component tree."
      );
    }
  }
}

// Hook to initialize the imperative API
export const useAlertInitializer = () => {
  const { showAlert } = useAlert();

  React.useEffect(() => {
    CustomAlertManager.setShowAlertCallback(showAlert);
  }, [showAlert]);
};

export { CustomAlertManager };
