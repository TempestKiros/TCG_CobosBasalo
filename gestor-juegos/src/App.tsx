import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Auth/Login";
import { Register } from "./components/Auth/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { GameList } from "./components/GameList/GameList"; // Coincide con el casing
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/games" element={<GameList />} />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        <Route path="/games" element={<GameList />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
