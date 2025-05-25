// src/components/Perfil/Perfil.tsx
import React, { useEffect, useState, useMemo } from "react";
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

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  description?: string;
  color: string;
}

interface DailySchedule {
  day: string;
  userId: string;
  timeSlots: TimeSlot[];
  updatedAt: Date;
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
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({ title: "", content: "" });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [dailySchedules, setDailySchedules] = useState<{
    [key: string]: DailySchedule;
  }>({});
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [isNewTimeSlot, setIsNewTimeSlot] = useState(false);

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

  const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

  // Generar datos de contribución realistas
  const contributionData = useMemo(() => {
    const data = [];
    const startDate = new Date("2025-01-01");

    // Encontrar el primer domingo del año para alinear correctamente
    let currentDate = new Date(startDate);
    while (currentDate.getDay() !== 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Generar 53 semanas de datos (371 días para cubrir todo el año)
    for (let i = 0; i < 371; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);

      // Generar nivel de actividad con patrones más realistas
      let level = 0;
      const random = Math.random();
      const dayOfWeek = date.getDay();

      // Más actividad en fines de semana
      const weekendBonus = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 0;

      // Crear algunos períodos de alta/baja actividad
      const dayOfYear = Math.floor(
        (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const seasonalPattern = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 0.2;

      const activityChance = 0.4 + weekendBonus + seasonalPattern;

      if (random < activityChance) {
        if (random < activityChance * 0.3) level = 1;
        else if (random < activityChance * 0.6) level = 2;
        else if (random < activityChance * 0.8) level = 3;
        else level = 4;
      }

      data.push({
        date: new Date(date),
        level: level,
        hours: level * (1 + Math.random() * 2), // 0-8 horas aproximadamente
      });
    }

    return data;
  }, []);

  // Agrupar datos por semanas para el grid
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < contributionData.length; i += 7) {
      weeks.push(contributionData.slice(i, i + 7));
    }
    return weeks;
  }, [contributionData]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const activeDays = contributionData.filter((day) => day.level > 0).length;
    const totalHours = contributionData.reduce(
      (sum, day) => sum + day.hours,
      0
    );

    // Calcular racha máxima
    let maxStreak = 0;
    let currentStreak = 0;

    contributionData.forEach((day) => {
      if (day.level > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return {
      activeDays,
      totalHours: Math.round(totalHours),
      gamesCompleted: Math.floor(totalHours / 15), // Asumiendo 15 horas por juego
      maxStreak,
    };
  }, [contributionData]);

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

    const fetchSchedules = async () => {
      const db = getDatabase();
      const schedulesRef = ref(db, `horarios-diarios/${user.uid}`);

      try {
        const snapshot = await get(schedulesRef);
        if (snapshot.exists()) {
          setDailySchedules(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    fetchUserData();
    fetchSchedules();
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

  const showContributionsInfo = () => {
    setToastContent({
      title: "💡 ¿Cómo contamos las contribuciones?",
      content: `
        📊 **Sistema de Actividad Gaming:**
        
        🎮 **Niveles de Intensidad:**
        • Sin color: Sin actividad gaming
        • Verde claro: 1-2 horas de juego
        • Verde medio: 2-4 horas de juego  
        • Verde intenso: 4-6 horas de juego
        • Verde máximo: 6+ horas de juego
        
        📅 **Patrones de Actividad:**
        • Más actividad en fines de semana
        • Variaciones estacionales a lo largo del año
        • Rachas de gaming intenso y períodos de descanso
        
        📈 **Estadísticas Calculadas:**
        • Días activos: Días con cualquier actividad gaming
        • Horas totales: Suma de todas las horas jugadas
        • Juegos completados: Estimado (15 horas = 1 juego)
        • Racha máxima: Días consecutivos con actividad
        
        🕒 **Horarios de la Semana:**
        Los horarios muestran tus compañeros de gaming favoritos para cada día, con sus niveles actuales y disponibilidad.
      `,
    });
    setShowToast(true);
  };

  const showScheduleInfo = (day: string) => {
    setToastContent({
      title: `📅 Horarios de ${day}`,
      content: `
        🎮 **Compañeros de Gaming - ${day}:**
        
        👤 **TheClone (Level 24)**
        • Especialidad: Juegos de estrategia
        • Horario típico: Tardes y noches
        • Estado: Activo frecuentemente
        
        👤 **DeepPlayer (Level 18)**  
        • Especialidad: RPGs y aventuras
        • Horario típico: Mañanas y fines de semana
        • Estado: Jugador dedicado
        
        💡 **Funciones de los Horarios:**
        • Planifica sesiones de gaming cooperativo
        • Encuentra compañeros con niveles similares
        • Organiza torneos y competencias
        • Coordina horarios para juegos multijugador
        
        🔔 **Próximamente:**
        • Notificaciones cuando están en línea
        • Sistema de invitaciones automáticas
        • Calendario de eventos grupales
      `,
    });
    setShowToast(true);
  };

  const closeToast = () => {
    setShowToast(false);
    setTimeout(() => {
      setToastContent({ title: "", content: "" });
    }, 300);
  };

  const showDaySchedule = (day: string) => {
    setSelectedDay(day);
    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setEditingTimeSlot(null);
    setIsNewTimeSlot(false);
  };

  const saveSchedule = async (day: string, timeSlots: TimeSlot[]) => {
    const db = getDatabase();
    const scheduleRef = ref(db, `horarios-diarios/${user.uid}/${day}`);

    try {
      const scheduleData: DailySchedule = {
        day,
        userId: user.uid,
        timeSlots,
        updatedAt: new Date(),
      };

      await set(scheduleRef, scheduleData);
      setDailySchedules((prev) => ({
        ...prev,
        [day]: scheduleData,
      }));
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const addTimeSlot = () => {
    const newTimeSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: "09:00",
      endTime: "10:00",
      activity: "",
      description: "",
      color: "#3B82F6",
    };
    setEditingTimeSlot(newTimeSlot);
    setIsNewTimeSlot(true);
    // Temporalmente ocultar el modal de horario
    setShowScheduleModal(false);
  };

  const editTimeSlot = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setIsNewTimeSlot(false);
    // Temporalmente ocultar el modal de horario
    setShowScheduleModal(false);
  };

  const saveTimeSlot = async (timeSlot: TimeSlot) => {
    if (!timeSlot.activity || !timeSlot.startTime || !timeSlot.endTime) {
      return;
    }

    const currentSchedule = dailySchedules[selectedDay] || { timeSlots: [] };
    let updatedTimeSlots;

    if (isNewTimeSlot) {
      updatedTimeSlots = [...currentSchedule.timeSlots, timeSlot];
    } else {
      updatedTimeSlots = currentSchedule.timeSlots.map((slot) =>
        slot.id === timeSlot.id ? timeSlot : slot
      );
    }

    // Ordenar por hora de inicio
    updatedTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    await saveSchedule(selectedDay, updatedTimeSlots);

    // Cerrar editor y mostrar modal de horario nuevamente
    setEditingTimeSlot(null);
    setIsNewTimeSlot(false);
    setShowScheduleModal(true);
  };

  const cancelTimeSlotEdit = () => {
    setEditingTimeSlot(null);
    setIsNewTimeSlot(false);
    setShowScheduleModal(true);
  };

  const deleteTimeSlot = async (timeSlotId: string) => {
    const currentSchedule = dailySchedules[selectedDay] || { timeSlots: [] };
    const updatedTimeSlots = currentSchedule.timeSlots.filter(
      (slot) => slot.id !== timeSlotId
    );
    await saveSchedule(selectedDay, updatedTimeSlots);
  };

  const getSchedulePreview = (day: string) => {
    const schedule = dailySchedules[day];
    if (!schedule || schedule.timeSlots.length === 0) {
      return [
        {
          name: "Sin horarios",
          time: "Agregar actividades",
          color: "bg-gray-500",
        },
        {
          name: "Click para editar",
          time: "Personalizar",
          color: "bg-gray-600",
        },
      ];
    }

    return schedule.timeSlots.slice(0, 2).map((slot) => ({
      name: slot.activity || "Actividad",
      time: `${slot.startTime} - ${slot.endTime}`,
      color: slot.color,
    }));
  };

  // Avatar por defecto adaptativo al tema
  const avatarUrl =
    userData?.avatar || user.photoURL || "https://i.pravatar.cc/150?img=3";
  const displayName = userData?.username || user.displayName || "Usuario";

  const getContributionColor = (level: number) => {
    const colors = {
      light: [
        "bg-gray-200 hover:bg-gray-300",
        "bg-green-200 hover:bg-green-300",
        "bg-green-300 hover:bg-green-400",
        "bg-green-400 hover:bg-green-500",
        "bg-green-500 hover:bg-green-600",
      ],
      dark: [
        "bg-gray-800 hover:bg-gray-700",
        "bg-green-900 hover:bg-green-800",
        "bg-green-700 hover:bg-green-600",
        "bg-green-500 hover:bg-green-400",
        "bg-green-300 hover:bg-green-200",
      ],
      purple: [
        "bg-gray-800 hover:bg-gray-700",
        "bg-purple-900 hover:bg-purple-800",
        "bg-purple-700 hover:bg-purple-600",
        "bg-purple-500 hover:bg-purple-400",
        "bg-purple-300 hover:bg-purple-200",
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
                <span className="font-bold text-blue-400">
                  {Math.round(stats.totalHours / 12)}h
                </span>
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
              {gruposBotones.flat().map((dia, index) => {
                const preview = getSchedulePreview(dia);
                return (
                  <div
                    key={dia}
                    className={`${themeClasses.cardBg} rounded-xl p-6 border ${themeClasses.borderColor} ${themeClasses.hover} transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer`}
                    onClick={() => showDaySchedule(dia)}
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                      <span className="text-blue-400">📅</span>
                      <span>Horarios {dia}</span>
                      <span
                        className={`ml-auto text-xs ${themeClasses.textSecondary} bg-blue-500/20 px-2 py-1 rounded`}
                      >
                        {dailySchedules[dia]?.timeSlots.length || 0} actividades
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {preview.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center ${themeClasses.inputBg} rounded-lg p-3`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full mr-3`}
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            <div
                              className={`text-xs ${themeClasses.textSecondary}`}
                            >
                              {item.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico de horas jugadas FUNCIONAL mejorado */}
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

            {/* Grid de contribuciones estilo GitHub FUNCIONAL */}
            <div className="mb-6">
              {/* Encabezados de meses */}
              <div className="flex mb-2 ml-6">
                {meses.map((mes, index) => (
                  <div
                    key={mes}
                    className={`text-xs ${themeClasses.textSecondary} font-medium`}
                    style={{
                      width: `${100 / 12}%`,
                      textAlign: "left",
                      marginLeft: index === 0 ? "0" : `${index * 4.3}px`,
                    }}
                  >
                    {mes}
                  </div>
                ))}
              </div>

              {/* Grid principal */}
              <div className="flex">
                {/* Días de la semana */}
                <div className="flex flex-col mr-2">
                  {diasSemana.map((dia, index) => (
                    <div
                      key={dia}
                      className={`text-xs ${themeClasses.textSecondary} h-3 flex items-center mb-1`}
                      style={{ opacity: index % 2 === 0 ? 1 : 0 }}
                    >
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Grid de contribuciones */}
                <div className="flex gap-1">
                  {weeklyData.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm ${getContributionColor(
                            day.level
                          )} 
                                    hover:ring-2 hover:ring-blue-400 transition-all duration-200 cursor-pointer`}
                          title={`${
                            day.level > 0
                              ? `${day.hours.toFixed(1)} horas`
                              : "Sin actividad"
                          } el ${day.date.toLocaleDateString("es-ES")}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Leyenda inferior */}
              <div
                className={`flex justify-between items-center text-xs ${themeClasses.textSecondary} mt-4`}
              >
                <span
                  className="hover:text-blue-400 cursor-pointer transition-colors"
                  onClick={showContributionsInfo}
                >
                  💡 Aprende cómo contamos las contribuciones
                </span>
                <div className="flex items-center space-x-2">
                  <span>Menos</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-3 ${getContributionColor(
                        level
                      )} rounded-sm`}
                    />
                  ))}
                  <span>Más</span>
                </div>
              </div>
            </div>

            {/* Estadísticas DINÁMICAS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center hover:bg-opacity-80 transition-all`}
              >
                <div className="text-2xl font-bold text-green-400">
                  {stats.activeDays}
                </div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Días activos
                </div>
              </div>
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center hover:bg-opacity-80 transition-all`}
              >
                <div className="text-2xl font-bold text-blue-400">
                  {stats.totalHours}
                </div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Horas totales
                </div>
              </div>
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center hover:bg-opacity-80 transition-all`}
              >
                <div className="text-2xl font-bold text-purple-400">
                  {stats.gamesCompleted}
                </div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Juegos completados
                </div>
              </div>
              <div
                className={`${themeClasses.inputBg} rounded-lg p-4 text-center hover:bg-opacity-80 transition-all`}
              >
                <div className="text-2xl font-bold text-yellow-400">
                  {stats.maxStreak}
                </div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Racha máxima
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span>
                  🎮 Última actividad:{" "}
                  {contributionData
                    .filter((d) => d.level > 0)
                    .pop()
                    ?.date.toLocaleDateString("es-ES")}
                </span>
                <span>
                  📊 Promedio diario: {(stats.totalHours / 365).toFixed(1)}{" "}
                  horas
                </span>
                <span>🏆 Mejor racha: {stats.maxStreak} días consecutivos</span>
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

      {/* Toast de información */}
      {showToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeToast}
          ></div>

          {/* Toast */}
          <div
            className={`relative ${themeClasses.cardBg} border ${
              themeClasses.borderColor
            } rounded-2xl shadow-2xl max-w-2xl mx-4 transform transition-all duration-300 ${
              showToast ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Header del toast */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-blue-400">
                {toastContent.title}
              </h3>
              <button
                onClick={closeToast}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content del toast */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className={`${themeClasses.text} space-y-4`}>
                {toastContent.content.split("\n").map((line, index) => {
                  if (line.trim() === "") return <br key={index} />;

                  if (line.includes("**") && line.includes(":**")) {
                    // Títulos de sección
                    const cleanLine = line
                      .replace(/\*\*/g, "")
                      .replace(":", "");
                    return (
                      <h4
                        key={index}
                        className="text-lg font-semibold text-green-400 flex items-center space-x-2"
                      >
                        <span>{cleanLine}</span>
                      </h4>
                    );
                  } else if (line.includes("**")) {
                    // Subtítulos
                    const cleanLine = line.replace(/\*\*/g, "");
                    return (
                      <h5
                        key={index}
                        className="font-medium text-purple-400 mt-3 mb-1"
                      >
                        {cleanLine}
                      </h5>
                    );
                  } else if (line.startsWith("•")) {
                    // Lista de puntos
                    return (
                      <p
                        key={index}
                        className={`${themeClasses.textSecondary} ml-4 flex items-start space-x-2`}
                      >
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{line.substring(1).trim()}</span>
                      </p>
                    );
                  } else if (line.trim().length > 0) {
                    // Texto normal
                    return (
                      <p key={index} className={themeClasses.textSecondary}>
                        {line.trim()}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Footer del toast */}
            <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={closeToast}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Horario Diario */}
      {showScheduleModal && !editingTimeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeScheduleModal}
          ></div>

          <div
            className={`relative ${themeClasses.cardBg} border ${themeClasses.borderColor} rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-blue-400 flex items-center space-x-2">
                <Calendar className="w-6 h-6" />
                <span>Horario de {selectedDay}</span>
              </h3>
              <button
                onClick={closeScheduleModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Timeline del día */}
              <div className="space-y-4">
                {(dailySchedules[selectedDay]?.timeSlots || [])
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((timeSlot) => (
                    <div
                      key={timeSlot.id}
                      className={`${themeClasses.inputBg} rounded-lg p-4 border-l-4 hover:bg-opacity-80 transition-all`}
                      style={{ borderLeftColor: timeSlot.color }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: timeSlot.color }}
                          ></div>
                          <h4 className="font-semibold text-lg">
                            {timeSlot.activity}
                          </h4>
                          <span
                            className={`text-sm ${themeClasses.textSecondary} bg-blue-500/20 px-2 py-1 rounded`}
                          >
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => editTimeSlot(timeSlot)}
                            className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/20 rounded-lg transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTimeSlot(timeSlot.id)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {timeSlot.description && (
                        <p
                          className={`text-sm ${themeClasses.textSecondary} ml-7`}
                        >
                          {timeSlot.description}
                        </p>
                      )}
                    </div>
                  ))}

                {/* Mensaje cuando no hay horarios */}
                {(!dailySchedules[selectedDay] ||
                  dailySchedules[selectedDay].timeSlots.length === 0) && (
                  <div
                    className={`${themeClasses.inputBg} rounded-lg p-8 text-center border-2 border-dashed ${themeClasses.borderColor}`}
                  >
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-400 mb-2">
                      Sin actividades programadas
                    </h4>
                    <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
                      Agrega tu primera actividad para organizar tu día
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {dailySchedules[selectedDay]?.timeSlots.length || 0} actividades
                programadas
              </span>
              <button
                onClick={addTimeSlot}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Agregar Actividad</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Franja Horaria */}
      {editingTimeSlot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={() => {
              setEditingTimeSlot(null);
              setIsNewTimeSlot(false);
            }}
          ></div>

          <div
            className={`relative ${themeClasses.cardBg} border ${themeClasses.borderColor} rounded-2xl shadow-2xl max-w-md w-full mx-4 z-10`}
          >
            <div className="p-6">
              <h4 className="text-xl font-bold text-green-400 mb-4">
                {isNewTimeSlot ? "Nueva Actividad" : "Editar Actividad"}
              </h4>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text} mb-2`}
                  >
                    Nombre de la Actividad
                  </label>
                  <input
                    type="text"
                    value={editingTimeSlot.activity}
                    onChange={(e) =>
                      setEditingTimeSlot({
                        ...editingTimeSlot,
                        activity: e.target.value,
                      })
                    }
                    className={`w-full ${themeClasses.inputBg} ${themeClasses.text} rounded-lg px-4 py-2 border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Ej: Sesión de gaming, Streaming, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text} mb-2`}
                    >
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={editingTimeSlot.startTime}
                      onChange={(e) =>
                        setEditingTimeSlot({
                          ...editingTimeSlot,
                          startTime: e.target.value,
                        })
                      }
                      className={`w-full ${themeClasses.inputBg} ${themeClasses.text} rounded-lg px-4 py-2 border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text} mb-2`}
                    >
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={editingTimeSlot.endTime}
                      onChange={(e) =>
                        setEditingTimeSlot({
                          ...editingTimeSlot,
                          endTime: e.target.value,
                        })
                      }
                      className={`w-full ${themeClasses.inputBg} ${themeClasses.text} rounded-lg px-4 py-2 border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text} mb-2`}
                  >
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {[
                      "#3B82F6",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                      "#06B6D4",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setEditingTimeSlot({ ...editingTimeSlot, color })
                        }
                        className={`w-8 h-8 rounded-full border-2 ${
                          editingTimeSlot.color === color
                            ? "border-white"
                            : "border-gray-600"
                        } transition-all hover:scale-110`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text} mb-2`}
                  >
                    Descripción (Opcional)
                  </label>
                  <textarea
                    value={editingTimeSlot.description || ""}
                    onChange={(e) =>
                      setEditingTimeSlot({
                        ...editingTimeSlot,
                        description: e.target.value,
                      })
                    }
                    className={`w-full ${themeClasses.inputBg} ${themeClasses.text} rounded-lg px-4 py-2 border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none`}
                    rows={3}
                    placeholder="Descripción adicional..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelTimeSlotEdit}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveTimeSlot(editingTimeSlot)}
                  disabled={
                    !editingTimeSlot.activity ||
                    !editingTimeSlot.startTime ||
                    !editingTimeSlot.endTime
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  {isNewTimeSlot ? "Crear" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
