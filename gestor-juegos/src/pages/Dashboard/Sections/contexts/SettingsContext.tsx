// src/contexts/SettingsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Tipos para la configuración
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  horarios: boolean;
  recordatorios: boolean;
}

export interface GeneralSettings {
  idioma: "es" | "en" | "fr";
  formato24h: boolean;
  autoSave: boolean;
  theme: "light" | "dark" | "purple";
}

export interface ProfileSettings {
  displayName: string;
  email: string;
}

export interface GlobalSettings {
  theme: "light" | "dark" | "purple";
  notifications: NotificationSettings;
  general: GeneralSettings;
  profile: ProfileSettings;
}

// Configuración por defecto
const defaultSettings: GlobalSettings = {
  theme: "dark",
  notifications: {
    email: true,
    push: false,
    horarios: true,
    recordatorios: true,
  },
  general: {
    idioma: "es",
    formato24h: true,
    autoSave: true,
    theme: "dark",
  },
  profile: {
    displayName: "Juan Pérez",
    email: "juan@ejemplo.com",
  },
};

// Interfaz del contexto
interface SettingsContextType {
  settings: GlobalSettings;
  updateTheme: (theme: "light" | "dark" | "purple") => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updateGeneral: (general: Partial<GeneralSettings>) => void;
  updateProfile: (profile: Partial<ProfileSettings>) => void;
  resetSettings: () => void;
  getThemeClasses: () => ThemeClasses;
}

// Tipos para las clases de tema
export interface ThemeClasses {
  bg: string;
  text: string;
  cardBg: string;
  inputBg: string;
  borderColor: string;
  textSecondary: string;
  accent: string;
  hover: string;
}

// Crear el contexto
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Provider del contexto
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    // Intentar cargar desde sessionStorage (temporal para la sesión)
    try {
      const saved = sessionStorage.getItem("gameManagerSettings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Guardar en sessionStorage cuando cambien las configuraciones
  useEffect(() => {
    try {
      sessionStorage.setItem("gameManagerSettings", JSON.stringify(settings));
    } catch (error) {
      console.warn("No se pudo guardar la configuración:", error);
    }
  }, [settings]);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;

    // Remover clases de tema existentes
    root.classList.remove("theme-light", "theme-dark", "theme-purple");

    // Agregar nueva clase de tema
    root.classList.add(`theme-${settings.theme}`);

    // Actualizar variables CSS personalizadas
    const themeClasses = getThemeClasses();
    root.style.setProperty("--bg-primary", getColorValue(themeClasses.bg));
    root.style.setProperty("--text-primary", getColorValue(themeClasses.text));
    root.style.setProperty("--bg-card", getColorValue(themeClasses.cardBg));
  }, [settings.theme]);

  // Función auxiliar para extraer valores de color de las clases Tailwind
  const getColorValue = (className: string): string => {
    const colorMap: { [key: string]: string } = {
      "bg-gray-100": "#f3f4f6",
      "bg-gray-900": "#111827",
      "bg-purple-900": "#581c87",
      "text-gray-900": "#111827",
      "text-white": "#ffffff",
      "bg-white": "#ffffff",
      "bg-gray-800": "#1f2937",
      "bg-purple-800": "#7c3aed",
    };
    return colorMap[className] || "#111827";
  };

  const updateTheme = (theme: "light" | "dark" | "purple") => {
    setSettings((prev) => ({
      ...prev,
      theme,
      general: {
        ...prev.general,
        theme,
      },
    }));
  };

  const updateNotifications = (
    notifications: Partial<NotificationSettings>
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...notifications,
      },
    }));
  };

  const updateGeneral = (general: Partial<GeneralSettings>) => {
    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        ...general,
      },
    }));
  };

  const updateProfile = (profile: Partial<ProfileSettings>) => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profile,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      sessionStorage.removeItem("gameManagerSettings");
    } catch (error) {
      console.warn("No se pudo limpiar la configuración:", error);
    }
  };

  const getThemeClasses = (): ThemeClasses => {
    switch (settings.theme) {
      case "light":
        return {
          bg: "bg-gray-100",
          text: "text-gray-900",
          cardBg: "bg-white",
          inputBg: "bg-gray-50",
          borderColor: "border-gray-300",
          textSecondary: "text-gray-600",
          accent: "bg-blue-600",
          hover: "hover:bg-gray-200",
        };
      case "purple":
        return {
          bg: "bg-purple-900",
          text: "text-white",
          cardBg: "bg-purple-800",
          inputBg: "bg-purple-700",
          borderColor: "border-purple-600",
          textSecondary: "text-purple-200",
          accent: "bg-purple-600",
          hover: "hover:bg-purple-700",
        };
      default: // dark
        return {
          bg: "bg-gray-900",
          text: "text-white",
          cardBg: "bg-gray-800",
          inputBg: "bg-gray-700",
          borderColor: "border-gray-600",
          textSecondary: "text-gray-400",
          accent: "bg-blue-600",
          hover: "hover:bg-gray-700",
        };
    }
  };

  const value: SettingsContextType = {
    settings,
    updateTheme,
    updateNotifications,
    updateGeneral,
    updateProfile,
    resetSettings,
    getThemeClasses,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe ser usado dentro de un SettingsProvider");
  }
  return context;
};

// Hook para obtener solo las clases del tema (optimizado)
export const useTheme = () => {
  const { settings, getThemeClasses } = useSettings();
  return {
    theme: settings.theme,
    themeClasses: getThemeClasses(),
  };
};
// Hook para obtener solo las configuraciones de notificaciones
