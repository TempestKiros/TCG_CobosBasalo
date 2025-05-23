import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar/Navbar";
import Perfil from "./Sections/Perfil";
import HorariosSection from "./Sections/Horarios";
import JuegosSection from "./Sections/Juegos";
import AnunciosSection from "./Sections/Anuncios";
import AjustesSection from "./Sections/Ajustes";
import { obtenerHorarios } from "../../services/horarios";

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [section, setSection] = useState<
    "perfil" | "horarios" | "juegos" | "anuncios" | "Foros" | "ajustes"
  >("perfil");
  const [horarios, setHorarios] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      obtenerHorarios(user.uid).then(setHorarios);
    }
  }, [user]);

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
          <HorariosSection data={horarios} user={user} />
        )}
        {section === "juegos" && <JuegosSection />}
        {section === "anuncios" && !isAnonymous && <AnunciosSection />}
        {section === "ajustes" && !isAnonymous && (
          <AjustesSection user={user} />
        )}
        {section === "Foros" && !isAnonymous}
        {(section === "anuncios" || section === "ajustes") && isAnonymous && (
          <div>Esta sección no está disponible en modo invitado.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
