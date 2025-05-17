// src/pages/Dashboard/Sections/Ajustes.tsx
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { useTheme } from "../../../hooks/useTheme";

const Ajustes: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h2>Ajustes</h2>

      <div>
        <label>Tema:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="purple">Morado oscuro</option>
        </select>
      </div>

      <div>
        <label>Idioma:</label>
        <select>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <button onClick={() => signOut(auth)}>Cerrar sesión</button>
    </div>
  );
};

export default Ajustes;
