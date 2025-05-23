// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.code === "auth/invalid-credential"
          ? "Credenciales inválidas"
          : "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setError("");
    setIsAnonymousLoading(true);

    try {
      const userCred = await signInAnonymously(auth);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Error al iniciar sesión anónima: " + err.message);
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="ejemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2  text-gray-700 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full  text-gray-700 mb-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            "Iniciar Sesión"
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">o</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleAnonymousLogin}
          disabled={isAnonymousLoading}
          className="w-full  bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnonymousLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Conectando...</span>
            </div>
          ) : (
            "Entrar como invitado"
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  );
}
