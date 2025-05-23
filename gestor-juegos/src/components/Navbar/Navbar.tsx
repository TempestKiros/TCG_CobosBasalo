import React, { Dispatch, SetStateAction } from "react";
import styles from "./Navbar.module.css";

export type Section =
  | "perfil"
  | "horarios"
  | "juegos"
  | "anuncios"
  | "foros"
  | "ajustes";

interface NavbarProps {
  onSelect: Dispatch<SetStateAction<Section>>;
  active: Section;
}

const Navbar: React.FC<NavbarProps> = ({ onSelect, active }) => {
  const sections: Section[] = [
    "perfil",
    "horarios",
    "juegos",
    "anuncios",
    "foros",
    "ajustes",
  ];

  return (
    <nav className={styles.navbar}>
      {sections.map((sec) => (
        <button
          key={sec}
          className={`${styles.navItem} ${active === sec ? styles.active : ""}`}
          onClick={() => onSelect(sec)}
        >
          {sec.charAt(0).toUpperCase() + sec.slice(1)}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
