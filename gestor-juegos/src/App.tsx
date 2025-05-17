import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Auth/Login";
import { Register } from "./components/Auth/Register";
import { Home } from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import { PrivateRoute } from "./components/PrivateRoute";
import Perfil from "./pages/Dashboard/Sections/Perfil";
import Horarios from "./pages/Dashboard/Sections/Horarios";
import Juegos from "./pages/Dashboard/Sections/Juegos";
import Anuncios from "./pages/Dashboard/Sections/Anuncios";
import Ajustes from "./pages/Dashboard/Sections/Ajustes";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="perfil" element={<Perfil />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="juegos" element={<Juegos />} />
          <Route path="anuncios" element={<Anuncios />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
