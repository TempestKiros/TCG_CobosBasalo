import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom"; // ← IMPORTANTE

export function Login() {
  // 1) Declaro los estados
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // ← REDIRECCIÓN
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <h2 className="text-2xl mb-4">Iniciar sesión</h2>
      {error && <p className="text-red-500">{error}</p>}

      {/* Input de email */}
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
      />

      {/* Input de contraseña */}
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
      />

      <button
        type="submit"
        className="w-full py-2 rounded bg-blue-500 text-white"
      >
        Entrar
      </button>
    </form>
  );
}
