// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Login con correo/contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // (Opcional) Obtén el token si lo necesitas:
      // const token = await userCred.user.getIdToken();
      alert("Inicio de sesión correcto");
      navigate("/dashboard");
    } catch (err) {
      alert("Error al iniciar sesión: " + (err as Error).message);
    }
  };

  // Login anónimo
  const handleAnonymousLogin = async () => {
    try {
      const userCred = await signInAnonymously(auth);
      // const token = await userCred.user.getIdToken();
      alert("Sesión anónima iniciada");
      navigate("/dashboard");
    } catch (err) {
      alert("Error al iniciar sesión anónima: " + (err as Error).message);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit">Iniciar sesión</button>
      </form>

      <div className="divider">o</div>

      <button onClick={handleAnonymousLogin}>Entrar como invitado</button>
    </div>
  );
}
