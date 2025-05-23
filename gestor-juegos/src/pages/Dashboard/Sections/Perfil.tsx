import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";

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
    if (tempDescription.length > 50) return;

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

  const handleEditProfile = () => {
    setEditingProfile(true);
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
    switch (status) {
      case "online":
        return "En línea";
      case "away":
        return "Ausente";
      case "busy":
        return "Ocupado";
      case "invisible":
        return "Invisible";
      default:
        return "En línea";
    }
  };

  const startEditingDescription = () => {
    setTempDescription(description);
    setEditingDescription(true);
  };

  const cancelEditingDescription = () => {
    setTempDescription("");
    setEditingDescription(false);
  };

  // Avatar por defecto si no hay uno en userData
  const avatarUrl =
    userData?.avatar || user.photoURL || "https://i.pravatar.cc/150?img=3";
  const displayName = userData?.username || user.displayName || "Usuario";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-bold text-white">Horarios de la Semana</h1>
      </div>

      <div className="flex">
        {/* Sidebar izquierdo - Perfil */}
        <div className="w-69 bg-gray-800 min-h-screen p-4">
          {/* Avatar y info principal */}
          <div className="text-center mb-6">
            <div className="relative w-fit mx-auto">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-80 h-80 rounded-full mx-auto mb-3 border-2 border-orange-500"
              />

              {/* Botón circular de editar */}
              <button
                onClick={() => setEditingProfile(true)}
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md text-sm"
                title="Editar perfil"
              >
                ✎
              </button>
            </div>

            <h2 className="text-lg font-bold text-white mt-2">{displayName}</h2>

            {/* Status con dropdown */}
            <div className="relative mb-2">
              <div className="group">
                <div className="flex items-center justify-center cursor-pointer">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
                      status
                    )}`}
                  ></div>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300">
                    {getStatusText(status)}
                  </p>
                </div>

                {/* Dropdown de status */}
                <div className="absolute top-6 left-0 right-0 bg-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {["online", "away", "busy", "invisible"].map(
                    (statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => handleStatusChange(statusOption)}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 first:rounded-t-md last:rounded-b-md"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
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

            {/* Descripción editable */}
            <div className="mb-3">
              {editingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    maxLength={250}
                    placeholder="Añade una descripción..."
                    className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 resize-none"
                    rows={2}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {tempDescription.length}/250
                    </span>
                    <div className="space-x-1">
                      <button
                        onClick={handleSaveDescription}
                        className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                        disabled={tempDescription.length > 50}
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditingDescription}
                        className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={startEditingDescription}
                  className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 min-h-8 flex items-center justify-center border border-dashed border-gray-600 rounded px-2 py-1"
                >
                  {description || "Añadir descripción..."}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500">
              {userData?.timezone && (
                <p className="mb-1">🌍 {userData.timezone}</p>
              )}
              {userData?.favoriteGames &&
                userData.favoriteGames.some((game) => game.trim()) && (
                  <p>
                    🎮{" "}
                    {userData.favoriteGames
                      .filter((game) => game.trim())
                      .slice(0, 2)
                      .join(", ")}
                  </p>
                )}
            </div>
          </div>

          {/* Modal de edición de perfil */}
          {editingProfile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Editar Perfil</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={editForm.avatar}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          avatar: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={editForm.timezone}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          timezone: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Juegos Favoritos
                    </label>
                    {editForm.favoriteGames.map((game, index) => (
                      <input
                        key={index}
                        type="text"
                        value={game}
                        onChange={(e) => {
                          const newGames = [...editForm.favoriteGames];
                          newGames[index] = e.target.value;
                          setEditForm((prev) => ({
                            ...prev,
                            favoriteGames: newGames,
                          }));
                        }}
                        placeholder={`Juego ${index + 1}`}
                        className="w-full bg-gray-700 text-white px-3 py-1 rounded text-sm mb-1"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats de perfil */}
          <div className="mb-6 mt-4 text-sm text-gray-300">
            {/* Horas jugadas (nivel superior) */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="font-medium">Horas jugadas este mes:</span>
              <span></span>
            </div>

            {/* Siguiendo / Seguidores */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-medium">Siguiendo:</span>
                <span>15</span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span className="font-medium">Seguidores:</span>
                <span>28</span>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">
              📧 {userData?.email || user.email}
            </p>
          </div>

          {/* Organizations */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Organizations</h3>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">🏢 No organizations</div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-6">
          {/* Grid de horarios */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {gruposBotones.flat().map((dia, index) => (
              <div
                key={dia}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-2">Horarios {dia}</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-300">TheClone</span>
                    <span className="ml-auto text-xs text-gray-500">LEVEL</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-300">DeepPlayer</span>
                    <span className="ml-auto text-xs text-gray-500">LEVEL</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de horas jugadas */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Horas jugadas este mes</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  Contributions settings
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  2025
                </button>
              </div>
            </div>

            {/* Grid de contribuciones estilo GitHub */}
            <div className="mb-4">
              <div className="flex text-xs text-gray-500 mb-2">
                {meses.map((mes) => (
                  <div key={mes} className="flex-1 text-center">
                    {mes}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-52 gap-1">
                {Array.from({ length: 365 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${
                      Math.random() > 0.8
                        ? "bg-green-500"
                        : Math.random() > 0.6
                        ? "bg-green-400"
                        : Math.random() > 0.4
                        ? "bg-green-300"
                        : "bg-gray-700"
                    }`}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Learn how we count contributions</span>
                <div className="flex items-center space-x-1">
                  <span>Less</span>
                  <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
