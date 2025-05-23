import React from "react";

export const ForosSection: React.FC = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <h2 className="text-2xl font-bold mb-4">Foros</h2>
      <p className="text-gray-700">
        ¡Bienvenido a la sección de foros! Aquí podrás debatir, compartir ideas
        y participar con otros jugadores.
      </p>
      <div className="mt-4">
        <ul className="list-disc pl-6 text-gray-600">
          <li>💬 Discusiones generales</li>
          <li>🎮 Sugerencias de juegos</li>
          <li>🛠 Reportes y soporte</li>
        </ul>
      </div>
    </div>
  );
};
