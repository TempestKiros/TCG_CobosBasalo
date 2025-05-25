// src/pages/Settings/Ajustes.tsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Globe,
  User,
  Lock,
  Bell,
  Shield,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  Info,
  RefreshCw,
} from "lucide-react";
import { useSettings } from "./contexts/SettingsContext";
import { useNavigate } from "react-router-dom"; // Removido BrowserRouter
import { getAuth, signOut } from "firebase/auth"; // Importación corregida para v9+

interface UserType {
  displayName?: string | null;
  email?: string | null;
  uid: string;
}

interface AjustesProps {
  user?: UserType;
}

export const Ajustes: React.FC<AjustesProps> = ({ user }) => {
  const {
    settings,
    updateTheme,
    updateNotifications,
    updateGeneral,
    updateProfile,
    resetSettings,
    getThemeClasses,
  } = useSettings();

  const [activeSection, setActiveSection] = useState("perfil");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();

  // Estados locales para formularios
  const [profileForm, setProfileForm] = useState({
    displayName:
      settings.profile.displayName || user?.displayName || "Juan Pérez",
    email: settings.profile.email || user?.email || "juan@ejemplo.com",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sincronizar formulario con configuración global
  useEffect(() => {
    setProfileForm({
      displayName:
        settings.profile.displayName || user?.displayName || "Juan Pérez",
      email: settings.profile.email || user?.email || "juan@ejemplo.com",
    });
  }, [settings.profile, user]);

  const handleProfileUpdate = async () => {
    if (!profileForm.displayName.trim()) {
      setMessage({ text: "El nombre no puede estar vacío", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Simular actualización de perfil
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar configuración global
      updateProfile({
        displayName: profileForm.displayName,
        email: profileForm.email,
      });

      setMessage({ text: "Perfil actualizado correctamente", type: "success" });
    } catch (error: any) {
      setMessage({
        text: "Error al actualizar el perfil: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", type: "error" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({
        text: "La contraseña debe tener al menos 6 caracteres",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage({
        text: "Contraseña actualizada correctamente",
        type: "success",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setMessage({
        text: "Error al cambiar la contraseña: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Estados para modal personalizado
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Función de logout corregida
  const handleLogout = async () => {
    if (loading) return; // Evitar múltiples clics

    // Mostrar modal personalizado en lugar de confirm
    setShowLogoutModal(true);
  };

  // Función que ejecuta el logout real
  const executeLogout = async () => {
    setShowLogoutModal(false);
    setLoading(true);
    setMessage(null);

    try {
      // Obtener la instancia de auth correctamente
      const auth = getAuth();
      await signOut(auth);

      setMessage({ text: "Sesión cerrada correctamente", type: "success" });
      console.log("Logout exitoso");

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate("/login", { replace: true }); // replace: true evita volver atrás
      }, 1000);
    } catch (error: any) {
      console.error("Error detallado al cerrar sesión:", error);
      setMessage({
        text: `Error al cerrar sesión: ${error.message || "Error desconocido"}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "purple") => {
    updateTheme(newTheme);
    setMessage({
      text: `Tema cambiado a ${
        newTheme === "light"
          ? "claro"
          : newTheme === "dark"
          ? "oscuro"
          : "morado"
      }`,
      type: "success",
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    updateNotifications({ [key]: value });

    const labels = {
      email: "por email",
      push: "push",
      horarios: "de horarios",
      recordatorios: "generales",
    };

    setMessage({
      text: `Notificaciones ${labels[key as keyof typeof labels]} ${
        value ? "activadas" : "desactivadas"
      }`,
      type: "success",
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    updateGeneral({ [key]: value });

    let messageText = "";
    switch (key) {
      case "idioma":
        messageText = `Idioma cambiado a ${
          value === "es" ? "Español" : value === "en" ? "English" : "Français"
        }`;
        break;
      case "formato24h":
        messageText = `Formato de hora cambiado a ${
          value ? "24 horas" : "12 horas"
        }`;
        break;
      case "autoSave":
        messageText = `Guardado automático ${
          value ? "activado" : "desactivado"
        }`;
        break;
    }

    if (messageText) {
      setMessage({ text: messageText, type: "success" });
    }
  };

  const handleResetSettings = () => {
    const confirmReset = window.confirm(
      "¿Estás seguro de que quieres restablecer toda la configuración?"
    );
    if (!confirmReset) return;

    resetSettings();
    setMessage({
      text: "Configuración restablecida a valores por defecto",
      type: "success",
    });
  };

  const sections = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "apariencia", label: "Apariencia", icon: Palette },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "seguridad", label: "Seguridad", icon: Shield },
    { id: "general", label: "General", icon: Settings },
  ];

  const themes = [
    { value: "light", label: "Claro", description: "Tema claro tradicional" },
    { value: "dark", label: "Oscuro", description: "Tema oscuro moderno" },
    { value: "purple", label: "Morado", description: "Tema morado elegante" },
  ];

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const themeClasses = getThemeClasses();

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración</h1>
          <p className={themeClasses.textSecondary}>
            Personaliza tu experiencia y gestiona tu cuenta
          </p>
          <div className="mt-2 text-sm text-blue-400">
            ✨ Los cambios se aplican globalmente en toda la aplicación
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300 ${
              message.type === "success"
                ? "bg-green-900 border border-green-700 text-green-100"
                : "bg-red-900 border border-red-700 text-red-100"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <X className="w-5 h-5 text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main content - BrowserRouter removido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${themeClasses.cardBg} rounded-lg p-4 shadow-lg`}>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                        activeSection === section.id
                          ? "bg-blue-600 text-white shadow-md scale-105"
                          : `${themeClasses.textSecondary} hover:bg-opacity-10 hover:bg-blue-500 hover:text-blue-400`
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className={`${themeClasses.cardBg} rounded-lg p-6 shadow-lg`}>
              {/* Perfil */}
              {activeSection === "perfil" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Mi Perfil</h2>
                      <p className={themeClasses.textSecondary}>
                        Actualiza tu información personal (se guarda
                        globalmente)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                      >
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={profileForm.displayName}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                      >
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className={`w-full bg-gray-600 text-gray-400 px-4 py-3 rounded-lg border border-gray-600 cursor-not-allowed`}
                        placeholder="tu@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        El correo no se puede modificar
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 hover:scale-105 disabled:scale-100"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>Guardar cambios</span>
                  </button>
                </div>
              )}

              {/* Apariencia */}
              {activeSection === "apariencia" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Apariencia</h2>
                    <p className={themeClasses.textSecondary}>
                      Personaliza la apariencia de toda la aplicación
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-4`}
                    >
                      Tema de la aplicación (Tema actual:{" "}
                      <span className="text-blue-400 font-semibold">
                        {settings.theme}
                      </span>
                      )
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {themes.map((themeOption) => (
                        <div
                          key={themeOption.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                            settings.theme === themeOption.value
                              ? "border-blue-500 bg-blue-900/20 shadow-lg"
                              : `border-gray-600 hover:border-gray-500 ${themeClasses.cardBg}`
                          }`}
                          onClick={() =>
                            handleThemeChange(
                              themeOption.value as "light" | "dark" | "purple"
                            )
                          }
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">
                              {themeOption.label}
                            </h3>
                            {settings.theme === themeOption.value && (
                              <Check className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <p
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            {themeOption.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notificaciones */}
              {activeSection === "notificaciones" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Notificaciones</h2>
                    <p className={themeClasses.textSecondary}>
                      Configura cómo y cuándo recibir notificaciones
                      (configuración global)
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className={`flex items-center justify-between p-4 ${themeClasses.inputBg} rounded-lg transition-all duration-200 hover:scale-102`}
                        >
                          <div>
                            <h3 className="font-medium capitalize">
                              {key === "email"
                                ? "Notificaciones por email"
                                : key === "push"
                                ? "Notificaciones push"
                                : key === "horarios"
                                ? "Recordatorios de horarios"
                                : "Recordatorios generales"}
                            </h3>
                            <p
                              className={`text-sm ${themeClasses.textSecondary}`}
                            >
                              {key === "email"
                                ? "Recibe actualizaciones por correo electrónico"
                                : key === "push"
                                ? "Notificaciones en tiempo real"
                                : key === "horarios"
                                ? "Avisos sobre tus horarios programados"
                                : "Recordatorios y alertas importantes"}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(value)}
                              onChange={(e) =>
                                handleNotificationChange(key, e.target.checked)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Seguridad */}
              {activeSection === "seguridad" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Seguridad</h2>
                    <p className={themeClasses.textSecondary}>
                      Gestiona la seguridad de tu cuenta
                    </p>
                  </div>

                  <div className={`${themeClasses.inputBg} p-6 rounded-lg`}>
                    <h3 className="text-lg font-semibold mb-4">
                      Cambiar contraseña
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                        >
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className={`w-full ${
                              settings.theme === "light"
                                ? "bg-white"
                                : "bg-gray-600"
                            } ${
                              themeClasses.text
                            } px-4 py-3 pr-12 rounded-lg border ${
                              themeClasses.borderColor
                            } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                            placeholder="Nueva contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} hover:text-blue-400 transition-colors`}
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                        >
                          Confirmar nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className={`w-full ${
                              settings.theme === "light"
                                ? "bg-white"
                                : "bg-gray-600"
                            } ${
                              themeClasses.text
                            } px-4 py-3 pr-12 rounded-lg border ${
                              themeClasses.borderColor
                            } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                            placeholder="Confirmar contraseña"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} hover:text-blue-400 transition-colors`}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        disabled={
                          loading ||
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword
                        }
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 hover:scale-105 disabled:scale-100"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                        <span>Cambiar contraseña</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* General */}
              {activeSection === "general" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Configuración General
                    </h2>
                    <p className={themeClasses.textSecondary}>
                      Ajustes generales de la aplicación (configuración global)
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label
                        className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                      >
                        Idioma de la interfaz
                      </label>
                      <select
                        value={settings.general.idioma}
                        onChange={(e) =>
                          handleConfigChange("idioma", e.target.value)
                        }
                        className={`${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 ${themeClasses.inputBg} rounded-lg transition-all duration-200 hover:scale-102`}
                    >
                      <div>
                        <h3 className="font-medium">Formato de 24 horas</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          Usar formato de 24 horas en lugar de AM/PM
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.formato24h}
                          onChange={(e) =>
                            handleConfigChange("formato24h", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 ${themeClasses.inputBg} rounded-lg transition-all duration-200 hover:scale-102`}
                    >
                      <div>
                        <h3 className="font-medium">Guardado automático</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          Guardar cambios automáticamente
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.autoSave}
                          onChange={(e) =>
                            handleConfigChange("autoSave", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Sección de configuración actual */}
                    <div className={`${themeClasses.inputBg} p-4 rounded-lg`}>
                      <h3 className="font-medium mb-3 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        <span>Configuración actual</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={themeClasses.textSecondary}>
                            Tema:
                          </span>
                          <span className="ml-2 text-blue-400 font-semibold">
                            {settings.theme === "light"
                              ? "Claro"
                              : settings.theme === "dark"
                              ? "Oscuro"
                              : "Morado"}
                          </span>
                        </div>
                        <div>
                          <span className={themeClasses.textSecondary}>
                            Idioma:
                          </span>
                          <span className="ml-2 text-blue-400 font-semibold">
                            {settings.general.formato24h
                              ? "Activado"
                              : "Desactivado"}
                          </span>
                        </div>
                        <div>
                          <span className={themeClasses.textSecondary}>
                            Auto-guardado:
                          </span>
                          <span className="ml-2 text-blue-400 font-semibold">
                            {settings.general.autoSave
                              ? "Activado"
                              : "Desactivado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-600 pt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Info className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold">
                          Zona de peligro
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <button
                          onClick={handleResetSettings}
                          disabled={loading}
                          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 hover:scale-105 disabled:scale-100"
                        >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                          <span>Restablecer configuración</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 hover:scale-105 disabled:scale-100"
                        >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <LogOut className="w-5 h-5" />
                          )}
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación personalizado */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div
            className={`${themeClasses.cardBg} rounded-lg p-6 max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Cerrar sesión</h3>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Esta acción cerrará tu sesión actual
                </p>
              </div>
            </div>

            <p className={`mb-6 ${themeClasses.textSecondary}`}>
              ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a
              iniciar sesión para acceder a tu cuenta.
            </p>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`px-4 py-2 rounded-lg border ${themeClasses.borderColor} ${themeClasses.textSecondary} hover:bg-gray-100 hover:bg-opacity-10 transition-all duration-200`}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={executeLogout}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
