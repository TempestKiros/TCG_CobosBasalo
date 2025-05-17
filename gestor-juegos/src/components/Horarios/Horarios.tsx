// src/components/Horarios.jsx
import React from "react";
import styles from "./Horarios.module.css";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves"];

const generarHorarios = () => {
  return diasSemana.map((dia) => ({
    dia,
    horas: Math.floor(Math.random() * 5) + 1,
  }));
};

export default function Horarios() {
  const horarios = generarHorarios();

  return (
    <div className={styles.grid}>
      {horarios.map(({ dia, horas }) => (
        <div key={dia} className={styles.card}>
          <h3>{dia}</h3>
          <p>{horas} horas jugadas</p>
        </div>
      ))}
    </div>
  );
}
