import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";

type ThemeKey = "claro" | "oscuro" | "oceano" | "galaxia";

interface RegisterProps {
  theme?: ThemeKey;
}

export default function Register({ theme = "oscuro" }: RegisterProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    favoriteGames: ["", "", "", "", ""],
  });

  const themes: Record<
    ThemeKey,
    {
      bg: string;
      cardBg: string;
      text: string;
      textSecondary: string;
      border: string;
      input: string;
      inputFocus: string;
      button: string;
      accent: string;
    }
  > = {
    claro: {
      bg: "bg-white",
      cardBg: "bg-gray-50",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-300",
      input: "bg-white border-gray-300 text-gray-900",
      inputFocus: "focus:border-blue-500 focus:ring-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
      accent: "text-blue-600",
    },
    oscuro: {
      bg: "bg-gray-900",
      cardBg: "bg-gray-800",
      text: "text-white",
      textSecondary: "text-gray-300",
      border: "border-gray-600",
      input: "bg-gray-700 border-gray-600 text-white placeholder-gray-400",
      inputFocus: "focus:border-blue-400 focus:ring-blue-400",
      button: "bg-blue-600 hover:bg-blue-500",
      accent: "text-blue-400",
    },
    oceano: {
      bg: "bg-slate-900",
      cardBg: "bg-slate-800",
      text: "text-slate-100",
      textSecondary: "text-slate-300",
      border: "border-slate-600",
      input:
        "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400",
      inputFocus: "focus:border-cyan-400 focus:ring-cyan-400",
      button: "bg-cyan-600 hover:bg-cyan-500",
      accent: "text-cyan-400",
    },
    galaxia: {
      bg: "bg-black",
      cardBg: "bg-gray-900",
      text: "text-white",
      textSecondary: "text-gray-400",
      border: "border-gray-700",
      input: "bg-gray-800 border-gray-700 text-white placeholder-gray-500",
      inputFocus: "focus:border-purple-400 focus:ring-purple-400",
      button: "bg-purple-600 hover:bg-purple-500",
      accent: "text-purple-400",
    },
  };

  const currentTheme = themes[theme] || themes.oscuro;

  const [loading, setLoading] = useState(false);
  type Errors = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    avatar?: string;
    favoriteGames?: string;
    general?: string;
    [key: string]: string | undefined;
  };
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  // Validaciones mejoradas
  const validateForm = () => {
    const newErrors: Errors = {};

    if (!form.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (form.username.length < 3) {
      newErrors.username = "Debe tener al menos 3 caracteres";
    } else if (form.username.length > 20) {
      newErrors.username = "Máximo 20 caracteres";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (form.avatar && !/^https?:\/\/.+\..+/.test(form.avatar)) {
      newErrors.avatar = "URL de avatar inválida";
    }

    const filledGames = form.favoriteGames.filter((game) => game.trim());
    if (filledGames.length > 5) {
      newErrors.favoriteGames = "Máximo 5 juegos permitidos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para actualizar campos del formulario
  const updateField = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validación en tiempo real
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "username":
        if (!value.trim()) {
          newErrors.username = "El nombre de usuario es requerido";
        } else if (value.length < 3) {
          newErrors.username = "Debe tener al menos 3 caracteres";
        } else {
          delete newErrors.username;
        }
        break;
      case "email":
        if (!value.trim()) {
          newErrors.email = "El email es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Formato de email inválido";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "La contraseña es requerida";
        } else if (value.length < 6) {
          newErrors.password = "Debe tener al menos 6 caracteres";
        } else {
          delete newErrors.password;
        }
        break;
      case "confirmPassword":
        if (value !== form.password) {
          newErrors.confirmPassword = "Las contraseñas no coinciden";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
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
      try {
        // Esperar un momento para que se complete la autenticación
        await new Promise((resolve) => setTimeout(resolve, 100));

        const userDoc = {
          uid: userCredential.user.uid,
          username: form.username,
          email: form.email,
          timezone: form.timezone,
          favoriteGames: form.favoriteGames.filter(Boolean),
          avatar: form.avatar || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userDoc);
        console.log("Usuario guardado en Firestore");
      } catch (firestoreError) {
        console.error("Error guardando en Firestore:", firestoreError);
        // El usuario se creó en Auth pero no se guardó info adicional
      }
      // Se redirige al usuario a la página de inicio o dashboard
      window.location.href = "/noticias";
      setSuccess(true);
    } catch (err) {
      console.error("Error en registro:", err);

      // Mensajes de error más amigables
      let errorMessage = "Error desconocido";
      if (typeof err === "object" && err !== null && "code" in err) {
        const errorWithCode = err as { code?: string; message?: string };
        if (errorWithCode.code === "auth/email-already-in-use") {
          errorMessage = "Este email ya está registrado";
          setErrors({ email: errorMessage });
        } else if (errorWithCode.code === "auth/weak-password") {
          errorMessage = "La contraseña es muy débil";
          setErrors({ password: errorMessage });
        } else if (errorWithCode.code === "auth/invalid-email") {
          errorMessage = "Email inválido";
          setErrors({ email: errorMessage });
        } else if (errorWithCode.code === "auth/operation-not-allowed") {
          errorMessage = "Registro no permitido";
        } else if (errorWithCode.code === "auth/network-request-failed") {
          errorMessage = "Error de conexión. Verifica tu internet";
        } else {
          errorMessage = errorWithCode.message || errorMessage;
        }

        if (
          !errorWithCode.code?.includes("email") &&
          !errorWithCode.code?.includes("password")
        ) {
          setErrors({ general: errorMessage });
        }
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    Object.keys(errors).length === 0 &&
    form.username.trim() &&
    form.email.trim() &&
    form.password &&
    form.confirmPassword;

  const filledGamesCount = form.favoriteGames.filter((game) =>
    game.trim()
  ).length;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
        <p className="text-gray-600">Únete a nuestra comunidad de gamers</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                ¡Registro exitoso!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Bienvenido {form.username}. Tu cuenta ha sido creada.
              </p>
            </div>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      <div onSubmit={handleRegister} className="space-y-6">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nombre de usuario *
          </label>
          <input
            id="username"
            type="text"
            placeholder="Tu nombre de usuario"
            value={form.username}
            onChange={(e) => {
              updateField("username", e.target.value);
              validateField("username", e.target.value);
            }}
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            disabled={loading}
            maxLength={20}
          />
          {errors.username && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.username}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {form.username.length}/20 caracteres
          </p>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Correo electrónico *
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => {
              updateField("email", e.target.value);
              validateField("email", e.target.value);
            }}
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Contraseña *
          </label>
          <input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => {
              updateField("password", e.target.value);
              validateField("password", e.target.value);
            }}
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            disabled={loading}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.password}
            </p>
          )}
          <div className="mt-2">
            <div className="flex items-center space-x-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  form.password.length >= 6 ? "bg-green-400" : "bg-gray-300"
                }`}
              ></div>
              <span
                className={
                  form.password.length >= 6 ? "text-green-600" : "text-gray-500"
                }
              >
                Al menos 6 caracteres
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirmar contraseña *
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            value={form.confirmPassword}
            onChange={(e) => {
              updateField("confirmPassword", e.target.value);
              validateField("confirmPassword", e.target.value);
            }}
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            disabled={loading}
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
          {form.confirmPassword && form.password === form.confirmPassword && (
            <p className="text-green-600 text-sm mt-1 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Las contraseñas coinciden
            </p>
          )}
        </div>

        {/* Avatar URL */}
        <div>
          <label
            htmlFor="avatar"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Avatar URL (opcional)
          </label>
          <input
            id="avatar"
            type="url"
            placeholder="https://ejemplo.com/tu-avatar.jpg"
            value={form.avatar}
            onChange={(e) => updateField("avatar", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.avatar
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            disabled={loading}
          />
          {errors.avatar && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.avatar}
            </p>
          )}
        </div>

        {/* Favorite Games */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Juegos Favoritos (opcional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Comparte hasta 5 de tus juegos favoritos ({filledGamesCount}/5)
          </p>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <input
                key={i}
                type="text"
                placeholder={`Juego favorito ${i + 1}`}
                value={form.favoriteGames[i]}
                onChange={(e) => {
                  const games = [...form.favoriteGames];
                  games[i] = e.target.value;
                  updateField("favoriteGames", games);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={loading}
              />
            ))}
          </div>
          {errors.favoriteGames && (
            <p className="text-red-600 text-sm mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.favoriteGames}
            </p>
          )}
        </div>

        {/* Timezone Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Zona horaria detectada
              </p>
              <p className="text-sm text-blue-700">{form.timezone}</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleRegister}
          disabled={loading || !isFormValid}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
            loading || !isFormValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creando cuenta...
            </div>
          ) : (
            "Crear cuenta"
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
