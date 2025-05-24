import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar/Navbar";
import { Perfil } from "./Sections/Perfil";
// Cambiamos la importación del componente de horarios
import { HorariosSection } from "./Sections/components/HorariosSection";
import { Juegos } from "./Sections/Juegos";
import ForosSection from "./Sections/Foros";
import { Anuncios } from "./Sections/Anuncios";
import { Ajustes } from "./Sections/Ajustes";
// Usamos el nuevo hook de horarios
import { useHorarios } from "../../hooks/useHorarios";

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [section, setSection] = useState<
    "perfil" | "horarios" | "juegos" | "anuncios" | "foros" | "ajustes"
  >("perfil");

  // Usamos el nuevo hook de horarios que se conecta a MongoDB
  const {
    horarios,
    loading: horariosLoading,
    error: horariosError,
    loadHorarios,
    createHorario, // Agregamos createHorario del hook
  } = useHorarios(user?.uid || "");

  const handleHorarioCreated = async (nuevoHorario: any) => {
    console.log(
      "📅 Dashboard: Horario creado, llamando a createHorario del hook..."
    );
    try {
      // Ya no necesitamos llamar createHorario aquí porque
      // HorariosSection debería usar su propio createHorarioAPI
      // Pero podemos recargar para asegurar sincronización
      console.log("🔄 Recargando horarios para asegurar sincronización...");
      await loadHorarios();
    } catch (error) {
      console.error("❌ Error en handleHorarioCreated:", error);
    }
  };

  // Debug logs
  console.log("🏠 Dashboard renderizado:", {
    userId: user?.uid,
    totalHorarios: horarios.length,
    loading: horariosLoading,
    error: horariosError,
  });

  if (isLoading || !user) return <div>Cargando...</div>;

  const isAnonymous = user.isAnonymous;

  return (
    <div className="dashboard">
      <Navbar onSelect={setSection} active={section} />
      <div className="content">
        {isAnonymous && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#ffeeba",
              marginBottom: "1rem",
            }}
          >
            <strong>Estás usando una sesión como invitado.</strong>
            <br />
            Tus datos podrían perderse si cierras la sesión.
          </div>
        )}

        {section === "perfil" && <Perfil user={user} />}

        {section === "horarios" && (
          <>
            {horariosLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #3498db",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 1rem",
                  }}
                />
                <p>Cargando tus horarios...</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : horariosError ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "48px", marginBottom: "1rem" }}>❌</div>
                <h2>Error cargando horarios</h2>
                <p style={{ color: "#666", marginBottom: "1rem" }}>
                  {horariosError}
                </p>
                <button
                  onClick={loadHorarios}
                  style={{
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Reintentar
                </button>
                <p
                  style={{ fontSize: "12px", color: "#999", marginTop: "1rem" }}
                >
                  Asegúrate de que el servidor backend esté ejecutándose en
                  http://localhost:5000
                </p>
              </div>
            ) : (
              <HorariosSection
                data={horarios}
                user={user}
                onHorarioCreated={handleHorarioCreated}
              />
            )}
          </>
        )}

        {section === "juegos" && <Juegos />}
        {section === "anuncios" && !isAnonymous && <Anuncios />}
        {section === "ajustes" && !isAnonymous && <Ajustes user={user} />}
        {section === "foros" && !isAnonymous && <ForosSection />}

        {(section === "anuncios" ||
          section === "ajustes" ||
          section === "foros") &&
          isAnonymous && (
            <div>Esta sección no está disponible en modo invitado.</div>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
