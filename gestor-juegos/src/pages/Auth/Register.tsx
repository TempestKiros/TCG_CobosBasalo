import { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  RotateCw,
  ZoomIn,
  ZoomOut,
  X,
  Check,
  Gamepad2,
  Clock,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Move,
} from "lucide-react";

interface UserDoc {
  username: string;
  email: string;
  avatar: string;
  timezone: string;
  favoriteGames: string[];
  createdAt: string;
  uid: string;
}

export default function Register() {
  const [formData, setFormData] = useState({
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
  const [redirecting, setRedirecting] = useState(false); // ✅ Estado faltante agregado
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para el editor de imagen
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lista de juegos populares para sugerencias
  const popularGames = [
    "League of Legends",
    "Valorant",
    "Fortnite",
    "Call of Duty",
    "Minecraft",
    "Among Us",
    "Rocket League",
    "Apex Legends",
    "Counter-Strike",
    "Overwatch",
    "FIFA",
    "Fall Guys",
    "Genshin Impact",
    "World of Warcraft",
    "Grand Theft Auto",
  ];

  // Funciones de interacción con imagen
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("Mouse down", e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    console.log("Mouse move", e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    console.log("Mouse up");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log("Touch start");
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    console.log("Touch move");
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    console.log("Touch end");
  };

  const handleZoomChange = (newZoom: number) => {
    console.log("Zoom:", newZoom);
    setZoom(newZoom);
  };

  const handleRotationChange = (newRotation: number) => {
    console.log("Rotation:", newRotation);
    setRotation(newRotation);
  };

  const resetImageEditor = () => {
    console.log("Reset editor");
    setZoom(1);
    setRotation(0);
  };

  const applyImageEdits = () => {
    console.log("Apply edits");
    // Aquí puedes procesar la imagen editada
  };

  // ✅ Función corregida para navegación
  const navigateToDashboard = () => {
    setRedirecting(true);
    // Simular navegación (en una app real usarías React Router)
    setTimeout(() => {
      console.log("Navegando a dashboard/perfil...");
      alert(
        "Redirigiendo al dashboard...\n(En una aplicación real esto navegaría a /dashboard/perfil)"
      );
      setRedirecting(false);
    }, 1500);
  };

  // ✅ Función de manejo de cambios mejorada
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("favoriteGame-")) {
      const index = parseInt(name.split("-")[1]);
      if (!isNaN(index) && index >= 0 && index < 5) {
        const newFavoriteGames = [...formData.favoriteGames];
        newFavoriteGames[index] = value;
        setFormData((prev) => ({ ...prev, favoriteGames: newFavoriteGames }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Función de manejo de archivos mejorada
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño del archivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "La imagen debe ser menor a 5MB",
      }));
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Solo se permiten archivos de imagen",
      }));
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (imageUrl) {
        setOriginalImage(imageUrl);
        setShowImageEditor(true);
        // Resetear estados del editor
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setErrors((prev) => ({ ...prev, avatar: "" }));
      }
    };
    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        avatar: "Error al leer el archivo",
      }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Función de validación mejorada
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = "Nombre de usuario requerido";
    } else if (formData.username.trim().length < 3) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 3 caracteres";
    } else if (formData.username.trim().length > 20) {
      newErrors.username =
        "El nombre de usuario no puede exceder 20 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = "Solo se permiten letras, números y guiones bajos";
    }

    // Validar email
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = "Email requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = "Email inválido";
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = "Contraseña requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Debe tener al menos una mayúscula, una minúscula y un número";
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Función de envío mejorada
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      // Simular proceso de registro
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Crear datos del usuario
      const userData: UserDoc = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        avatar: editedImage || "",
        timezone: formData.timezone,
        favoriteGames: formData.favoriteGames.filter(
          (game) => game.trim() !== ""
        ),
        createdAt: new Date().toISOString(),
        uid: `user_${Date.now()}`, // Simular UID
      };

      console.log("Usuario registrado exitosamente:", userData);
      setSuccess(true);

      // Limpiar datos sensibles
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      // Opcional: navegar al dashboard después del registro exitoso
      setTimeout(() => {
        navigateToDashboard();
      }, 2000);
    } catch (error: any) {
      console.error("Error en el registro:", error);
      setErrors({ general: "Error en el registro. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para remover avatar mejorada
  const removeAvatar = () => {
    setEditedImage(null);
    setOriginalImage(null);
    setAvatarFile(null);
    setFormData((prev) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Limpiar errores relacionados con avatar
    if (errors.avatar) {
      setErrors((prev) => ({ ...prev, avatar: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Crear Cuenta
          </h2>
          <p className="text-gray-600">Únete a nuestra comunidad gamer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Foto de Perfil
            </label>

            <div className="relative inline-block">
              {editedImage || formData.avatar ? (
                <div className="relative">
                  <img
                    src={editedImage || formData.avatar}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400 hover:border-blue-400 transition-colors">
                  <Camera size={32} className="text-gray-500" />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Upload size={16} className="mr-2" />
                {editedImage || formData.avatar ? "Cambiar" : "Subir Foto"}
              </button>

              {(editedImage || formData.avatar) && originalImage && (
                <button
                  type="button"
                  onClick={() => setShowImageEditor(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                >
                  Editar
                </button>
              )}
            </div>

            {errors.avatar && (
              <p className="text-red-500 text-sm mt-2">{errors.avatar}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Username */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tu nombre de usuario"
              className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.username ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-1" />
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className={`w-full px-4 py-3 pr-12 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-1" />
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={`w-full px-4 py-3 pr-12 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.confirmPassword
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Timezone */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Zona horaria
            </label>
            <input
              type="text"
              name="timezone"
              value={formData.timezone}
              readOnly
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Favorite Games */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Gamepad2 size={16} className="inline mr-1" />
              Juegos Favoritos (opcional)
            </label>
            <div className="space-y-3">
              {formData.favoriteGames.map((game, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    name={`favoriteGame-${index}`}
                    value={game}
                    onChange={handleChange}
                    placeholder={`Juego favorito ${index + 1}`}
                    list={`games-list-${index}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <datalist id={`games-list-${index}`}>
                    {popularGames.map((popularGame) => (
                      <option key={popularGame} value={popularGame} />
                    ))}
                  </datalist>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Puedes escribir o seleccionar de las sugerencias
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || redirecting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registrando...</span>
              </div>
            ) : redirecting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Redirigiendo...</span>
              </div>
            ) : (
              "Crear Cuenta"
            )}
          </button>

          {success && (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center border border-green-200">
              <Check size={20} className="inline mr-2" />
              ¡Registro exitoso! Bienvenido a la comunidad.
            </div>
          )}

          {errors.general && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center border border-red-200">
              {errors.general}
            </div>
          )}
        </form>
      </div>

      {/* ✅ Editor de Imagen Completo - IMPLEMENTADO */}
      {showImageEditor && originalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Editar Imagen</h3>
              <button
                onClick={() => setShowImageEditor(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Área de previsualización */}
            <div
              ref={containerRef}
              className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Imagen */}
              <img
                ref={imageRef}
                src={originalImage}
                alt="Preview"
                className="absolute top-1/2 left-1/2 max-w-none pointer-events-none select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                  width: "auto",
                  height: "auto",
                  maxWidth: "none",
                  maxHeight: "none",
                }}
                draggable={false}
              />

              {/* Overlay de recorte circular */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Fondo semitranscurente */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                {/* Círculo de recorte */}
                <div
                  className="absolute border-4 border-white rounded-full shadow-lg bg-transparent"
                  style={{
                    width: "200px",
                    height: "200px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
                  }}
                ></div>
                {/* Indicador central */}
                <div
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700 text-sm">
                <Move size={16} className="mr-2 flex-shrink-0" />
                <span>
                  Arrastra la imagen para posicionarla. Usa los controles para
                  ajustar el zoom y rotación. El área circular será tu avatar
                  final.
                </span>
              </div>
            </div>

            {/* Controles rápidos */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.1)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <ZoomOut size={14} className="mr-1" /> Zoom -
              </button>
              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.1)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <ZoomIn size={14} className="mr-1" /> Zoom +
              </button>
              <button
                type="button"
                onClick={() => handleRotationChange(rotation + 90)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RotateCw size={14} className="mr-1" /> Rotar
              </button>
              <button
                type="button"
                onClick={resetImageEditor}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reiniciar
              </button>
            </div>

            {/* Controles de precisión */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotación: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={rotation}
                  onChange={(e) =>
                    handleRotationChange(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowImageEditor(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyImageEdits}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Check size={16} className="mr-2" /> Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
