// src/pages/Dashboard/Dashboard.tsx
import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Perfil from "./Sections/Perfil";
import Horarios from "./Sections/Horarios";
import Juegos from "./Sections/Juegos";
import Anuncios from "./Sections/Anuncios";
import Ajustes from "./Sections/Ajustes";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const [section, setSection] = useState("perfil");

  const renderSection = () => {
    switch (section) {
      case "perfil":
        return <Perfil />;
      case "horarios":
        return <Horarios />;
      case "juegos":
        return <Juegos />;
      case "anuncios":
        return <Anuncios />;
      case "ajustes":
        return <Ajustes />;
      default:
        return <Perfil />;
    }
  };

  return (
    <div className={styles.dashboard}>
      <Navbar onSelect={setSection} activeSection={section} />
      <div className={styles.sectionContent}>{renderSection()}</div>
    </div>
  );
};

export default Dashboard;
