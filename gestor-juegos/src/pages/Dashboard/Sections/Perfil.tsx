// src/pages/Dashboard/Sections/Perfil.tsx
import React, { useState } from "react";
import "./Perfil.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { User } from "firebase/auth"; // IMPORTANTE

// ⬅️ Declara el tipo de las props
interface PerfilProps {
  user: User;
}

const dataEjemplo = [
  { semana: "01-07", horas: 5 },
  { semana: "08-14", horas: 12 },
  { semana: "15-21", horas: 7 },
  { semana: "22-28", horas: 13 },
];

const horariosSemana = [
  { día: "Lunes", hora: "18:00 - 20:00" },
  { día: "Miércoles", hora: "19:00 - 21:00" },
  { día: "Viernes", hora: "17:00 - 19:00" },
];

// ⬅️ Acepta las props aquí
const Perfil: React.FC<PerfilProps> = ({ user }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState("2025-05");

  return (
    <div className="perfil-layout">
      <aside className="perfil-sidebar">
        <img
          src="https://i.pravatar.cc/150?img=3"
          alt="Avatar"
          className="perfil-avatar"
        />
        <div className="perfil-info">
          <p>
            <strong>Nombre de Usuario:</strong>
            <br />
            {user.displayName || "Sin nombre"}
          </p>
          <p>
            <strong>Identificador del Usuario:</strong>
            <br />@{user.uid}
          </p>
          <p>
            <strong>Email:</strong>
            <br />
            {user.email}
          </p>
          <p>
            <strong>Miembro desde:</strong>
            <br />
            {user.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : "Desconocido"}
          </p>
        </div>
      </aside>

      <main className="perfil-contenido">
        <div className="perfil-controles">
          <label>Selecciona el mes: </label>
          <input
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          />
        </div>

        <div className="perfil-horarios">
          <h3>Horarios generados esta semana</h3>
          <table>
            <thead>
              <tr>
                <th>Día</th>
                <th>Horario</th>
              </tr>
            </thead>
            <tbody>
              {horariosSemana.map((h, i) => (
                <tr key={i}>
                  <td>{h.día}</td>
                  <td>{h.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="perfil-grafico">
          <h3>Horas jugadas en {mesSeleccionado}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataEjemplo}>
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="horas" fill="#58a6ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
