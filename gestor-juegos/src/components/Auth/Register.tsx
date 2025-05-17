import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Ajusta la ruta si tu firebase.ts está en otro lugar
import { useNavigate } from "react-router-dom"; // ← IMPORTANTE

export function Register() {
  // Estados para los campos y el error
  const navigate = useNavigate(); // ← NUEVO
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // ← REDIRECCIÓN tras registro
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <h2 className="text-2xl mb-4">Crear cuenta</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <label className="block mb-2">
        <span className="block text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-4">
        <span className="block text-sm font-medium">Contraseña</span>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full p-2 border rounded"
          required
          minLength={6}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Creando cuenta..." : "Registrarme"}
      </button>
    </form>
  );
}
