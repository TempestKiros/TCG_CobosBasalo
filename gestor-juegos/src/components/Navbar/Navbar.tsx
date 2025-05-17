// src/components/Navbar/Navbar.tsx
import React from "react";
import styles from "./Navbar.module.css";

interface NavbarProps {
  onSelect: (section: string) => void;
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ onSelect, activeSection }) => {
  const sections = ["perfil", "horarios", "juegos", "anuncios", "ajustes"];

  return (
    <nav className={styles.navbar}>
      {sections.map((sec) => (
        <button
          key={sec}
          className={`${styles.navItem} ${
            activeSection === sec ? styles.active : ""
          }`}
          onClick={() => onSelect(sec)}
        >
          {sec.charAt(0).toUpperCase() + sec.slice(1)}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
