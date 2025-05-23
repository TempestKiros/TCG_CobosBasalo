import React from "react";
import {
  BrowserRouter,
  Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SettingsProvider } from "./pages/Dashboard/Sections/contexts/SettingsContext";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { Home } from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import { PrivateRoute } from "./components/PrivateRoute";

// Componente Layout que aplicará el tema globalmente
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="app-layout">{children}</div>;
};

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Sólo una ruta para Dashboard */}
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            {/* Cualquier otra, al Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
