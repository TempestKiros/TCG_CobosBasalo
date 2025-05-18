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

const dataEjemplo = [
  { semana: "01-07", horas: 5 },
  { semana: "08-14", horas: 10 },
  { semana: "15-21", horas: 7 },
  { semana: "22-28", horas: 13 },
];

const horariosSemana = [
  { día: "Lunes", hora: "18:00 - 20:00" },
  { día: "Miércoles", hora: "19:00 - 21:00" },
  { día: "Viernes", hora: "17:00 - 19:00" },
];

const Perfil: React.FC = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState("2025-05");

  return (
    <div className="perfil-layout">
      {/* SIDEBAR PERFIL */}
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
            Deep Feeder
          </p>
          <p>
            <strong>Identificador del Usuario:</strong>
            <br />
            @TempestKiros
          </p>
          <p>
            <strong>Descripción:</strong>
            <br />
            Player by trade and a
          </p>
          <button className="perfil-editar">Editar perfil</button>
          <p>
            <strong>Email:</strong>
            <br />
            gamma.deep.feeders@gmail.com
          </p>
          <p>
            <strong>Miembro desde:</strong>
            <br />
            Enero 2024
          </p>
          <p>
            <strong>Seguidores:</strong> 0 · <strong>Siguiendo:</strong> 2
          </p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="perfil-contenido">
        {/* Selector de mes */}
        <div className="perfil-controles">
          <label>Selecciona el mes: </label>
          <input
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          />
        </div>
        {/* Tabla de horarios */}
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

        {/* Gráfico de barras */}
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
