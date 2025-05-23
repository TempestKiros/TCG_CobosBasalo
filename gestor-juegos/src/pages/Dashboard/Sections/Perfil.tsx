// src/components/Perfil/Perfil.tsx
import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import { useSettings, useTheme } from "./contexts/SettingsContext";
import {
  Edit3,
  Globe,
  Gamepad2,
  Mail,
  Users,
  UserPlus,
  Calendar,
  Clock,
  Trophy,
  Activity,
  Settings,
} from "lucide-react";
import { EditProfileModal } from "./contexts/EditProfileModal";

interface PerfilProps {
  user: User;
}

interface UserData {
  username: string;
  email: string;
  avatar: string;
  timezone: string;
  favoriteGames: string[];
  description?: string;
  status?: string;
}

export const Perfil: React.FC<PerfilProps> = ({ user }) => {
  const { settings } = useSettings();
  const { theme, themeClasses } = useTheme();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [description, setDescription] = useState<string>("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState("");
  const [status, setStatus] = useState<string>("online");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    avatar: "",
    timezone: "",
    favoriteGames: ["", "", "", "", ""],
  });

  const gruposBotones = [
    ["Lunes", "Martes"],
    ["Miércoles", "Jueves"],
    ["Viernes", "Sábado"],
    ["Domingo", "Extra"],
  ];

  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val() as UserData;
          setUserData(data);
          setDescription(data.description || "");
          setStatus(data.status || "online");
          setEditForm({
            username: data.username || "",
            avatar: data.avatar || "",
            timezone: data.timezone || "",
            favoriteGames: data.favoriteGames || ["", "", "", "", ""],
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user.uid]);

  const handleSaveDescription = async () => {
    if (tempDescription.length > 250) return;

    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}/description`);

    try {
      await set(userRef, tempDescription);
      setDescription(tempDescription);
      setEditingDescription(false);
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const db = getDatabase();
    const statusRef = ref(db, `users/${user.uid}/status`);

    try {
      await set(statusRef, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSaveProfile = async () => {
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);

    try {
      const updates = {
        username: editForm.username,
        avatar: editForm.avatar,
        timezone: editForm.timezone,
        favoriteGames: editForm.favoriteGames,
      };

      await set(userRef, { ...userData, ...updates });
      setUserData((prev) => (prev ? { ...prev, ...updates } : null));
      setEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: userData?.username || "",
      avatar: userData?.avatar || "",
      timezone: userData?.timezone || "",
      favoriteGames: userData?.favoriteGames || ["", "", "", "", ""],
    });
    setEditingProfile(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "invisible":
        return "bg-gray-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      online: "En línea",
      away: "Ausente",
      busy: "Ocupado",
      invisible: "Invisible",
    };
    return statusMap[status as keyof typeof statusMap] || "En línea";
  };

  const startEditingDescription = () => {
    setTempDescription(description);
    setEditingDescription(true);
  };

  const cancelEditingDescription = () => {
    setTempDescription("");
    setEditingDescription(false);
  };

  // Avatar por defecto adaptativo al tema
  const avatarUrl =
    userData?.avatar || user.photoURL || "https://i.pravatar.cc/150?img=3";
  const displayName = userData?.username || user.displayName || "Usuario";

  // Generar datos de contribuciones aleatorios
  const contributionData = Array.from({ length: 365 }, (_, i) => {
    const random = Math.random();
    return {
      level:
        random > 0.8
          ? 4
          : random > 0.6
          ? 3
          : random > 0.4
          ? 2
          : random > 0.2
          ? 1
          : 0,
      date: new Date(Date.now() - (365 - i) * 24 * 60 * 60 * 1000),
    };
  });

  const getContributionColor = (level: number) => {
    const colors = {
      light: [
        "bg-gray-200",
        "bg-green-200",
        "bg-green-300",
        "bg-green-400",
        "bg-green-500",
      ],
      dark: [
        "bg-gray-700",
        "bg-green-300",
        "bg-green-400",
        "bg-green-500",
        "bg-green-600",
      ],
      purple: [
        "bg-gray-700",
        "bg-purple-300",
        "bg-purple-400",
        "bg-purple-500",
        "bg-purple-600",
      ],
    };
    return colors[theme][level] || colors[theme][0];
  };

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} transition-colors duration-300`}
    >
      {/* Header */}
      <div
        className={`${themeClasses.cardBg} border-b ${themeClasses.borderColor} px-6 py-4 shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            <span>Perfil del Usuario</span>
          </h2>
          <div className="flex items-center space-x-3">
            <span className={`text-sm ${themeClasses.textSecondary}`}></span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar izquierdo - Perfil */}
        <div
          className={`w-100 ${themeClasses.cardBg} min-h-screen p-6 border-r ${themeClasses.borderColor} shadow-lg`}
        >
          {/* Avatar y info principal */}
          <div className="text-center mb-8">
            <div className="relative w-fit mx-auto mb-4">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-64 h-64 rounded-full mx-auto border-4 border-blue-500 shadow-xl"
              />
              <button
                onClick={() => setEditingProfile(true)}
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                title="Editar perfil"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-2">{displayName}</h2>

            {/* Status con dropdown mejorado */}
            <div className="relative mb-4">
              <div className="group">
                <div
                  className={`flex items-center justify-center cursor-pointer ${themeClasses.inputBg} rounded-lg p-2 ${themeClasses.hover} transition-all duration-200`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
                      status
                    )}`}
                  ></div>
                  <p className="text-sm font-medium">{getStatusText(status)}</p>
                </div>

                {/* Dropdown de status mejorado */}
                <div
                  className={`absolute top-12 left-0 right-0 ${themeClasses.cardBg} rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 border ${themeClasses.borderColor}`}
                >
                  {["online", "away", "busy", "invisible"].map(
                    (statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => handleStatusChange(statusOption)}
                        className={`w-full flex items-center px-4 py-3 text-sm ${themeClasses.hover} first:rounded-t-lg last:rounded-b-lg transition-colors`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(
                            statusOption
                          )}`}
                        ></div>
                        {getStatusText(statusOption)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Descripción editable mejorada */}
            <div className="mb-6">
              {editingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    maxLength={250}
                    placeholder="Añade una descripción..."
                    className={`w-full ${themeClasses.inputBg} ${themeClasses.text} rounded-lg px-4 py-3 resize-none border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${themeClasses.textSecondary}`}>
                      {tempDescription.length}/250
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={handleSaveDescription}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                        disabled={tempDescription.length > 250}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelEditingDescription}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={startEditingDescription}
                  className={`${themeClasses.inputBg} ${themeClasses.hover} cursor-pointer rounded-lg p-4 border-2 border-dashed ${themeClasses.borderColor} transition-all duration-200 hover:scale-102`}
                >
                  <p
                    className={`text-sm ${
                      description
                        ? themeClasses.text
                        : themeClasses.textSecondary
                    } text-center`}
                  >
                    {description || "✏️ Añadir descripción..."}
                  </p>
                </div>
              )}
            </div>

            {/* Info adicional mejorada */}
            <div className={`${themeClasses.inputBg} rounded-lg p-4 space-y-3`}>
              {userData?.timezone && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{userData.timezone}</span>
                </div>
              )}
              {userData?.favoriteGames &&
                userData.favoriteGames.some((game) => game.trim()) && (
                  <div className="flex items-start space-x-2">
                    <Gamepad2 className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div className="text-sm">
                      {userData.favoriteGames
                        .filter((game) => game.trim())
                        .slice(0, 2)
                        .join(", ")}
                    </div>
                  </div>
                )}
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-sm">{userData?.email || user.email}</span>
              </div>
            </div>
          </div>

          {/* Stats de perfil mejoradas */}
          <div className={`${themeClasses.inputBg} rounded-lg p-4 mb-6`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Estadísticas</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Horas este mes</span>
                </div>
                <span className="font-bold text-blue-400">127h</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Siguiendo</span>
                </div>
                <span className="font-bold text-green-400">15</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">Seguidores</span>
                </div>
                <span className="font-bold text-purple-400">28</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Logros</span>
                </div>
                <span className="font-bold text-yellow-400">42</span>
              </div>
            </div>
          </div>

          {/* Modal de edición de perfil mejorado */}
          <EditProfileModal
            isOpen={editingProfile}
            onClose={handleCancelEdit}
            onSave={handleSaveProfile}
            editForm={editForm}
            setEditForm={setEditForm}
            currentAvatar={avatarUrl}
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-8">
          {/* Grid de horarios mejorado */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span>Horarios de la Semana</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gruposBotones.flat().map((dia, index) => (
                <div
                  key={dia}
                  className={`${themeClasses.cardBg} rounded-xl p-6 border ${themeClasses.borderColor} ${themeClasses.hover} transition-all duration-300 hover:scale-105 shadow-lg`}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <span className="text-blue-400">📅</span>
                    <span>Horarios {dia}</span>
                  </h3>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center ${themeClasses.inputBg} rounded-lg p-3`}
                    >
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                      <span className="font-medium">TheClone</span>
                      <span
                        className={`ml-auto text-xs ${themeClasses.textSecondary} bg-yellow-500/20 px-2 py-1 rounded`}
                      >
                        LEVEL 24
                      </span>
                    </div>
                    <div
                      className={`flex items-center ${themeClasses.inputBg} rounded-lg p-3`}
                    >
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                      <span className="font-medium">DeepPlayer</span>
                      <span
                        className={`ml-auto text-xs ${themeClasses.textSecondary} bg-blue-500/20 px-2 py-1 rounded`}
                      >
                        LEVEL 18
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de horas jugadas mejorado */}
          <div
            className={`${themeClasses.cardBg} rounded-xl p-8 border ${themeClasses.borderColor} shadow-lg`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold flex items-center space-x-2 mb-4 md:mb-0">
                <Activity className="w-6 h-6 text-green-400" />
                <span>Actividad de Gaming - 2025</span>
              </h3>
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  Configuración de contribuciones
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
                  2025
                </button>
              </div>
            </div>

            {/* Grid de contribuciones estilo GitHub mejorado */}
            <div className="mb-6">
              <div
                className={`flex text-xs ${themeClasses.textSecondary} mb-3`}
              >
                {meses.map((mes) => (
                  <div key={mes} className="flex-1 text-center font-medium">
                    {mes}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-53 gap-1 mb-4">
                {contributionData.map((day, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${getContributionColor(
                      day.level
                    )} hover:ring-2 hover:ring-blue-400 transition-all duration-200 cursor-pointer`}
                    title={`${
                      day.level
                    } contribuciones el ${day.date.toLocaleDateString()}`}
                  ></div>
                ))}
              </div>

              <div
                className={`flex justify-between items-center text-xs ${themeClasses.textSecondary}`}
              >
                <span className="hover:text-blue-400 cursor-pointer transition-colors">
                  💡 Aprende cómo contamos las contribuciones
                </span>
                <div className="flex items-center space-x-2">
                  <span>Menos</span>
                  <div
                    className={`w-3 h-3 ${getContributionColor(0)} rounded-sm`}
                  ></div>
                  <div
                    className={`w-3 h-3 ${getContributionColor(1)} rounded-sm`}
                  ></div>
                  <div
                    className={`w-3 h-3 ${getContributionColor(2)} rounded-sm`}
                  ></div>
                  <div
                    className={`w-3 h-3 ${getContributionColor(3)} rounded-sm`}
                  ></div>
                  <div
                    className={`w-3 h-3 ${getContributionColor(4)} rounded-sm`}
                  ></div>
                  <span>Más</span>
                </div>
              </div>
            </div>

            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center`}
              >
                <div className="text-2xl font-bold text-green-400">342</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Días activos
                </div>
              </div>
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center`}
              >
                <div className="text-2xl font-bold text-blue-400">1,247</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Horas totales
                </div>
              </div>
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center`}
              >
                <div className="text-2xl font-bold text-purple-400">87</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Juegos completados
                </div>
              </div>
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center`}
              >
                <div className="text-2xl font-bold text-yellow-400">23</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Racha máxima
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de tema activo */}
      <div className="fixed bottom-6 left-6 z-30">
        <div
          className={`${themeClasses.cardBg} border ${themeClasses.borderColor} rounded-full px-4 py-2 shadow-lg backdrop-blur-lg`}
        >
          <span className={`text-sm ${themeClasses.textSecondary}`}>
            Tema:{" "}
            <span className="text-blue-400 font-semibold">
              {theme === "light"
                ? "☀️ Claro"
                : theme === "dark"
                ? "🌙 Oscuro"
                : "💜 Morado"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
