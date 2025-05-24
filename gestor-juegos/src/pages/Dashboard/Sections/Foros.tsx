// src/pages/Dashboard/Sections/Foros.tsx
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/config"; // ajusta la ruta
import { ForosSection } from "./components/ForosSection";

export const Foros: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Debes iniciar sesión para acceder a los foros</p>
      </div>
    );
  }

  return <ForosSection user={user} />;
};

export default Foros;
