import React, { useState, useRef } from "react";
import { useTheme } from "../contexts/SettingsContext"; // Usa el contexto correcto
import {
  X,
  Upload,
  User,
  Globe,
  Gamepad2,
  Save,
  Camera,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editForm: {
    username: string;
    avatar: string;
    timezone: string;
    favoriteGames: string[];
  };
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  currentAvatar: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editForm,
  setEditForm,
  currentAvatar,
}) => {
  const { theme, themeClasses } = useTheme(); // Usa el hook correcto del contexto
  const [activeSection, setActiveSection] = useState("general");
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(currentAvatar);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sections = [
    {
      id: "general",
      label: "Información General",
      icon: User,
      description: "Nombre y avatar",
    },
    {
      id: "location",
      label: "Ubicación",
      icon: Globe,
      description: "Zona horaria",
    },
    {
      id: "games",
      label: "Juegos Favoritos",
      icon: Gamepad2,
      description: "Tus juegos preferidos",
    },
  ];

  // Manejar carga de imagen por drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  // Procesar archivo de imagen
  const handleImageFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      setImageFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setEditForm((prev: any) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar imagen
  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage("");
    setEditForm((prev: any) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Agregar juego favorito
  const addFavoriteGame = () => {
    if (editForm.favoriteGames.length < 10) {
      setEditForm((prev: { favoriteGames: any }) => ({
        ...prev,
        favoriteGames: [...prev.favoriteGames, ""],
      }));
    }
  };

  // Eliminar juego favorito
  const removeFavoriteGame = (index: number) => {
    setEditForm((prev: { favoriteGames: any[] }) => ({
      ...prev,
      favoriteGames: prev.favoriteGames.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  // Actualizar juego favorito
  const updateFavoriteGame = (index: number, value: string) => {
    const newGames = [...editForm.favoriteGames];
    newGames[index] = value;
    setEditForm((prev: any) => ({
      ...prev,
      favoriteGames: newGames,
    }));
  };

  const handleSave = () => {
    // Incluir el archivo de imagen para procesamiento posterior
    const finalData = {
      ...editForm,
      imageFile: imageFile,
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className={`${themeClasses.cardBg} rounded-2xl w-full max-w-4xl min-h-[600px] max-h-[85vh] flex flex-col shadow-2xl border ${themeClasses.borderColor} transition-colors duration-300 my-4`}
      >
        {/* Header */}
        <div
          className={`border-b ${themeClasses.borderColor} p-6 flex-shrink-0`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${themeClasses.text}`}>
                Editar Perfil
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                Personaliza tu información y preferencias
              </p>
              <div className="mt-2 text-xs text-blue-400">
                ✨ Tema actual:{" "}
                {theme === "light"
                  ? "☀️ Claro"
                  : theme === "dark"
                  ? "🌙 Oscuro"
                  : "💜 Morado"}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${themeClasses.hover} p-2 rounded-lg transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div
            className={`w-80 ${themeClasses.inputBg} p-6 border-r ${themeClasses.borderColor} transition-colors duration-300`}
          >
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-600 text-white shadow-lg scale-102"
                        : `${themeClasses.hover} hover:scale-101 ${themeClasses.text}`
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div>
                        <div className="font-medium">{section.label}</div>
                        <div
                          className={`text-xs ${
                            activeSection === section.id
                              ? "text-blue-100"
                              : themeClasses.textSecondary
                          } mt-1`}
                        >
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Preview del perfil */}
            <div
              className={`mt-8 ${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.borderColor} shadow-sm`}
            >
              <h1 className={`font-semibold mb-3 text-sm ${themeClasses.text}`}>
                Vista Previa
              </h1>
              <div className="text-center">
                <img
                  src={previewImage || "https://i.pravatar.cc/150?img=3"}
                  alt="Preview"
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-blue-500"
                />
                <div className={`font-medium text-sm ${themeClasses.text}`}>
                  {editForm.username || "Nombre de usuario"}
                </div>
                <div className={`text-xs ${themeClasses.textSecondary}`}>
                  {editForm.timezone || "Zona horaria"}
                </div>
                <div className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                  {editForm.favoriteGames.filter((game) => game.trim()).length >
                  0
                    ? `${
                        editForm.favoriteGames.filter((game) => game.trim())
                          .length
                      } juegos favoritos`
                    : "Sin juegos favoritos"}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Sección General */}
            {activeSection === "general" && (
              <div className="space-y-8">
                <div>
                  <h3
                    className={`text-xl font-semibold mb-6 flex items-center space-x-2 ${themeClasses.text}`}
                  >
                    <User className="w-5 h-5" />
                    <span>Información General</span>
                  </h3>

                  {/* Upload de imagen */}
                  <div className="mb-8">
                    <label
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-4`}
                    >
                      Foto de Perfil
                    </label>

                    <div className="flex items-start space-x-6">
                      {/* Imagen actual */}
                      <div className="relative">
                        <img
                          src={
                            previewImage || "https://i.pravatar.cc/150?img=3"
                          }
                          alt="Avatar actual"
                          className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
                        />
                        {previewImage && (
                          <button
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Área de drag & drop */}
                      <div className="flex-1">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                            ${
                              dragOver
                                ? "border-blue-500 bg-blue-500/10 scale-105"
                                : `${themeClasses.borderColor} ${themeClasses.hover}`
                            }
                          `}
                        >
                          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <div className="space-y-2">
                            <p className={`font-medium ${themeClasses.text}`}>
                              Arrastra tu imagen aquí o
                            </p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                            >
                              selecciona un archivo
                            </button>
                          </div>
                          <p
                            className={`text-xs ${themeClasses.textSecondary} mt-2`}
                          >
                            PNG, JPG, GIF hasta 10MB
                          </p>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nombre de usuario */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                    >
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm((prev: any) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                      placeholder="Tu nombre de usuario"
                    />
                    <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                      Este nombre será visible para otros usuarios
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sección Ubicación */}
            {activeSection === "location" && (
              <div className="space-y-6">
                <h3
                  className={`text-xl font-semibold mb-6 flex items-center space-x-2 ${themeClasses.text}`}
                >
                  <Globe className="w-5 h-5" />
                  <span>Ubicación y Zona Horaria</span>
                </h3>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                  >
                    Zona Horaria
                  </label>
                  <select
                    value={editForm.timezone}
                    onChange={(e) =>
                      setEditForm((prev: any) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                  >
                    <option value="">Selecciona tu zona horaria</option>
                    <option value="GMT-12">
                      (GMT-12:00) Línea Internacional de Cambio de Fecha
                    </option>
                    <option value="GMT-11">(GMT-11:00) Samoa</option>
                    <option value="GMT-10">(GMT-10:00) Hawái</option>
                    <option value="GMT-9">(GMT-09:00) Alaska</option>
                    <option value="GMT-8">
                      (GMT-08:00) Pacífico (EE.UU. y Canadá)
                    </option>
                    <option value="GMT-7">
                      (GMT-07:00) Montaña (EE.UU. y Canadá)
                    </option>
                    <option value="GMT-6">
                      (GMT-06:00) Central (EE.UU. y Canadá)
                    </option>
                    <option value="GMT-5">
                      (GMT-05:00) Oriental (EE.UU. y Canadá)
                    </option>
                    <option value="GMT-4">
                      (GMT-04:00) Atlántico (Canadá)
                    </option>
                    <option value="GMT-3">(GMT-03:00) Argentina, Brasil</option>
                    <option value="GMT-2">(GMT-02:00) Atlántico Medio</option>
                    <option value="GMT-1">(GMT-01:00) Azores</option>
                    <option value="GMT+0">
                      (GMT+00:00) Londres, Dublin, Lisboa
                    </option>
                    <option value="GMT+1">
                      (GMT+01:00) Madrid, París, Roma
                    </option>
                    <option value="GMT+2">
                      (GMT+02:00) Atenas, Bucarest, Helsinki
                    </option>
                    <option value="GMT+3">
                      (GMT+03:00) Moscú, Kuwait, Riyadh
                    </option>
                    <option value="GMT+4">(GMT+04:00) Abu Dhabi, Muscat</option>
                    <option value="GMT+5">
                      (GMT+05:00) Islamabad, Karachi
                    </option>
                    <option value="GMT+6">(GMT+06:00) Almaty, Dhaka</option>
                    <option value="GMT+7">(GMT+07:00) Bangkok, Jakarta</option>
                    <option value="GMT+8">
                      (GMT+08:00) Beijing, Hong Kong, Singapur
                    </option>
                    <option value="GMT+9">(GMT+09:00) Tokio, Seúl</option>
                    <option value="GMT+10">
                      (GMT+10:00) Sydney, Melbourne
                    </option>
                    <option value="GMT+11">(GMT+11:00) Magadan</option>
                    <option value="GMT+12">
                      (GMT+12:00) Auckland, Wellington
                    </option>
                  </select>
                  <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                    Esto ayudará a mostrar los horarios correctos en la
                    aplicación
                  </p>
                </div>

                {/* Información adicional sobre zona horaria */}
                <div className={`${themeClasses.inputBg} rounded-lg p-4`}>
                  <h4 className={`font-medium mb-2 ${themeClasses.text}`}>
                    ℹ️ ¿Por qué necesitamos tu zona horaria?
                  </h4>
                  <ul
                    className={`text-sm ${themeClasses.textSecondary} space-y-1`}
                  >
                    <li>• Mostrar horarios de juego precisos</li>
                    <li>• Coordinar sesiones multijugador</li>
                    <li>• Enviar notificaciones en el momento adecuado</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Sección Juegos */}
            {activeSection === "games" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xl font-semibold flex items-center space-x-2 ${themeClasses.text}`}
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span>Juegos Favoritos</span>
                  </h3>
                  <button
                    onClick={addFavoriteGame}
                    disabled={editForm.favoriteGames.length >= 10}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Juego</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {editForm.favoriteGames.map((game, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={game}
                          onChange={(e) =>
                            updateFavoriteGame(index, e.target.value)
                          }
                          placeholder={`Juego favorito ${index + 1}`}
                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                        />
                      </div>
                      <button
                        onClick={() => removeFavoriteGame(index)}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {editForm.favoriteGames.length === 0 && (
                  <div
                    className={`${themeClasses.inputBg} rounded-lg p-8 text-center`}
                  >
                    <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className={`${themeClasses.textSecondary}`}>
                      No tienes juegos favoritos agregados
                    </p>
                    <button
                      onClick={addFavoriteGame}
                      className="mt-4 text-blue-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      Agregar tu primer juego favorito
                    </button>
                  </div>
                )}

                <div className={`${themeClasses.inputBg} rounded-lg p-4`}>
                  <h4 className={`font-medium mb-2 ${themeClasses.text}`}>
                    🎮 Consejos para juegos favoritos
                  </h4>
                  <ul
                    className={`text-sm ${themeClasses.textSecondary} space-y-1`}
                  >
                    <li>• Agrega hasta 10 juegos que más te gusten</li>
                    <li>
                      • Esto ayudará a otros usuarios a conocer tus gustos
                    </li>
                    <li>• Podrás encontrar personas con gustos similares</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones - SIEMPRE VISIBLE */}
        <div
          className={`border-t ${themeClasses.borderColor} p-6 flex-shrink-0 bg-opacity-95 backdrop-blur-sm`}
        >
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-medium ${themeClasses.inputBg} ${themeClasses.text} ${themeClasses.hover} transition-all duration-200 hover:scale-105 border ${themeClasses.borderColor}`}
            >
              ❌ Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
