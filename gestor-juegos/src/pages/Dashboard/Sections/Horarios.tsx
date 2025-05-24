import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/config"; // Ajusta la ruta según tu estructura
import { HorariosSection } from "./components/HorariosSection";
import { useHorarios } from "../../../hooks/useHorarios";
import { useTheme } from "./contexts/SettingsContext"; // Tu contexto correcto

// Componente de debug temporal
const ThemeDebug: React.FC = () => {
  const { theme, themeClasses } = useTheme();

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "12px",
        fontFamily: "monospace",
        maxWidth: "300px",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#00ff00" }}>
        🎨 Debug del Tema
      </h4>

      <div style={{ marginBottom: "10px" }}>
        <strong>Tema actual:</strong>{" "}
        <span style={{ color: "#00ffff" }}>{theme}</span>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>ThemeClasses:</strong>
      </div>

      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "10px",
        }}
      >
        {Object.entries(themeClasses).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "3px" }}>
            <span style={{ color: "#ffff00" }}>{key}:</span> {value}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Clases CSS aplicadas al documento:</strong>
      </div>
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        {Array.from(document.documentElement.classList).join(", ") || "Ninguna"}
      </div>

      {/* Test visual de colores */}
      <div style={{ marginTop: "15px" }}>
        <strong>Test visual:</strong>
        <div style={{ marginTop: "5px" }}>
          <div
            className={`${themeClasses.bg} ${themeClasses.text} p-2 rounded mb-2 border ${themeClasses.borderColor}`}
            style={{ border: "1px solid gray" }}
          >
            Fondo principal
          </div>
          <div
            className={`${themeClasses.cardBg} ${themeClasses.text} p-2 rounded mb-2 border ${themeClasses.borderColor}`}
            style={{ border: "1px solid gray" }}
          >
            Fondo de card
          </div>
          <div className={`${themeClasses.accent} text-white p-2 rounded mb-2`}>
            Color de acento
          </div>
          <div
            className={`${themeClasses.inputBg} ${themeClasses.text} p-2 rounded mb-2`}
            style={{ border: "1px solid gray" }}
          >
            Input background
          </div>
        </div>
      </div>

      {/* Botones para cambiar tema rápidamente */}
      <div style={{ marginTop: "15px" }}>
        <strong>Cambio rápido de tema:</strong>
        <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
          <button
            onClick={() => {
              const { useSettings } = require("./contexts/SettingsContext");
              // Este es un hack para testing, normalmente usarías el contexto
              console.log(
                "Cambiar a light - usa el componente de configuraciones"
              );
            }}
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              backgroundColor: "#f3f4f6",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Light
          </button>
          <button
            onClick={() =>
              console.log(
                "Cambiar a dark - usa el componente de configuraciones"
              )
            }
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              backgroundColor: "#1f2937",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Dark
          </button>
          <button
            onClick={() =>
              console.log(
                "Cambiar a purple - usa el componente de configuraciones"
              )
            }
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              backgroundColor: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Purple
          </button>
        </div>
      </div>
    </div>
  );
};

const Horarios: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const { theme, themeClasses } = useTheme(); // Directamente de tu contexto

  // Logs para debug
  console.log("🏠 Horarios component - Theme:", theme);
  console.log("🎨 Horarios component - ThemeClasses:", themeClasses);

  // Usar el hook personalizado para cargar horarios desde MongoDB
  const {
    horarios,
    loading: horariosLoading,
    error: horariosError,
    loadHorarios,
  } = useHorarios(user?.uid || "");

  const handleHorarioCreated = (nuevoHorario: any) => {
    // El horario ya se agrega automáticamente al estado a través del hook
    console.log("Horario creado exitosamente:", nuevoHorario);

    // Opcionalmente puedes mostrar una notificación de éxito aquí
    // toast.success('¡Horario creado exitosamente!');
  };

  // Mostrar loading mientras carga la autenticación
  if (loading) {
    return (
      <>
        <ThemeDebug />
        <div
          className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex items-center justify-center transition-colors duration-300`}
        >
          <div className="text-center">
            <div
              className={`w-16 h-16 border-4 ${themeClasses.accent} border-t-transparent rounded-full animate-spin mx-auto mb-4`}
            ></div>
            <p className={themeClasses.textSecondary}>
              Cargando autenticación...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Mostrar error de autenticación
  if (error) {
    return (
      <>
        <ThemeDebug />
        <div
          className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex items-center justify-center transition-colors duration-300`}
        >
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Error de autenticación</h2>
            <p className={themeClasses.textSecondary}>{error.message}</p>
          </div>
        </div>
      </>
    );
  }

  // Mostrar pantalla de login si no hay usuario
  if (!user) {
    return (
      <>
        <ThemeDebug />
        <div
          className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex items-center justify-center transition-colors duration-300`}
        >
          <div className="text-center">
            <div className="text-blue-500 text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold mb-2">Acceso requerido</h2>
            <p className={themeClasses.textSecondary}>
              Por favor, inicia sesión para ver tus horarios
            </p>
            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className={`mt-4 ${themeClasses.accent} hover:opacity-80 text-white px-6 py-2 rounded-lg transition-colors`}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </>
    );
  }

  // Mostrar loading de horarios
  if (horariosLoading) {
    return (
      <>
        <ThemeDebug />
        <div
          className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex items-center justify-center transition-colors duration-300`}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={themeClasses.textSecondary}>
              Cargando tus horarios...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Mostrar error de horarios
  if (horariosError) {
    return (
      <>
        <ThemeDebug />
        <div
          className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex items-center justify-center transition-colors duration-300`}
        >
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Error cargando horarios</h2>
            <p className={`${themeClasses.textSecondary} mb-4`}>
              {horariosError}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={loadHorarios}
                className={`${themeClasses.accent} hover:opacity-80 text-white px-6 py-2 rounded-lg transition-colors block w-full`}
              >
                Reintentar
              </button>
              <p className={`text-xs ${themeClasses.textSecondary}`}>
                Asegúrate de que el servidor backend esté ejecutándose en
                http://localhost:5000
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Renderizar la sección de horarios
  return (
    <>
      <ThemeDebug />
      <HorariosSection
        data={horarios}
        user={user}
        onHorarioCreated={handleHorarioCreated}
      />
    </>
  );
};

export default Horarios;
