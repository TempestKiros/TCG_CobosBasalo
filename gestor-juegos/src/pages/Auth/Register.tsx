import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

interface UserDoc {
  username: string;
  email: string;
  avatar: string;
  timezone: string;
  favoriteGames: string[];
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    favoriteGames: ["", "", "", "", ""],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.username.trim())
      newErrors.username = "Nombre de usuario requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Email inválido";
    if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await updateProfile(userCredential.user, {
        displayName: form.username,
        photoURL: form.avatar || null,
      });

      const userDoc: UserDoc = {
        username: form.username,
        email: form.email,
        avatar: form.avatar,
        timezone: form.timezone,
        favoriteGames: form.favoriteGames,
      };

      await set(ref(database, "users/" + userCredential.user.uid), userDoc);
      setSuccess(true);
      setForm({ ...form, password: "", confirmPassword: "" });
      navigate("/dashboard/perfil");
    } catch (error: any) {
      console.error("Error en registro:", error);
      setErrors({ general: error.message || "Error en el registro" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Registro
        </h2>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.username ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL (opcional)
            </label>
            <input
              type="url"
              name="avatar"
              value={form.avatar}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/avatar.jpg"
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
              <span>Registrando...</span>
            </div>
          ) : (
            "Registrarse"
          )}
        </button>

        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md text-center">
            ¡Registro exitoso! Puedes iniciar sesión
          </div>
        )}

        {errors.general && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}
      </form>
    </div>
  );
}
