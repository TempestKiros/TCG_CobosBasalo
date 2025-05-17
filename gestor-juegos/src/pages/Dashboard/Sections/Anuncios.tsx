// src/pages/Dashboard/Sections/Anuncios.tsx
import React from "react";

const Anuncios: React.FC = () => {
  return (
    <div>
      <h2>Noticias y Ofertas</h2>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h4>Noticias</h4>
          <ul>
            <li>Se anuncia GTA VI para 2025.</li>
            <li>Nueva expansión de Elden Ring revelada.</li>
          </ul>
        </div>
        <div>
          <h4>Ofertas</h4>
          <ul>
            <li>Steam: -50% en Red Dead Redemption 2</li>
            <li>Epic: Assassin's Creed gratis esta semana</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Anuncios;
