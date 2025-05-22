// src/pages/Dashboard/Sections/Horarios.tsx
import React from "react";
import styles from "./Horarios.module.css";

// Si tu horario viene con { _id, fecha, horas, detalles }
interface Horario {
  _id: string;
  fecha: string;
  horas: number;
  detalles?: any;
}

interface HorariosSectionProps {
  data: Horario[]; // <-- declaramos la prop
}

const HorariosSection: React.FC<HorariosSectionProps> = ({ data }) => {
  return (
    <div>
      <h2>Horarios Generados</h2>
      {data.length === 0 ? (
        <p>No tienes horarios guardados.</p>
      ) : (
        <ul>
          {data.map((h) => (
            <li key={h._id}>
              {new Date(h.fecha).toLocaleDateString()}: {h.horas} horas
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HorariosSection;
