// src/pages/Dashboard/Sections/Juegos.tsx
import React from "react";

const Juegos: React.FC = () => {
  return (
    <div>
      <h2>Mis Juegos</h2>
      <div>
        <h4>The Witcher 3</h4>
        <p>Horas jugadas: 150</p>
        <p>Plataforma: Steam</p>
      </div>
      <hr />
      <div>
        <h4>Overwatch 2</h4>
        <p>Horas jugadas: 70</p>
        <p>Plataforma: Battle.net</p>
      </div>
    </div>
  );
};

export default Juegos;
