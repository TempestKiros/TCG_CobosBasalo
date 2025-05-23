import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { getDatabase, ref, push, get, set } from "firebase/database";
import { useTheme } from "./contexts/SettingsContext";
import {
  Plus,
  Calendar,
  Clock,
  Save,
  X,
  Trash2,
  Edit3,
  Copy,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Star,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Target,
  Award,
  Zap,
} from "lucide-react";

interface Actividad {
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
  prioridad?: "alta" | "media" | "baja";
  categoria?: string;
  completada?: boolean;
}

interface Horario {
  _id: string;
  fecha: string;
  horas: number;
  detalles?: {
    lunes: Actividad[];
    martes: Actividad[];
    miercoles: Actividad[];
    jueves: Actividad[];
    viernes: Actividad[];
    sabado: Actividad[];
    domingo: Actividad[];
    extra: Actividad[];
  };
  userId: string;
  titulo?: string;
  descripcion?: string;
  completado?: boolean;
  progreso?: number;
}

interface HorariosSectionProps {
  data: Horario[];
  user: User;
  onHorarioCreated?: (horario: Horario) => void;
}

export const HorariosSection: React.FC<HorariosSectionProps> = ({
  data,
  user,
  onHorarioCreated,
}) => {
  const { themeClasses } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const actividadVacia: Actividad = {
    descripcion: "",
    horaInicio: "",
    horaFin: "",
    horas: 0,
    prioridad: "media",
    categoria: "",
    completada: false,
  };

  const [horarioForm, setHorarioForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    lunes: [{ ...actividadVacia }],
    martes: [{ ...actividadVacia }],
    miercoles: [{ ...actividadVacia }],
    jueves: [{ ...actividadVacia }],
    viernes: [{ ...actividadVacia }],
    sabado: [{ ...actividadVacia }],
    domingo: [{ ...actividadVacia }],
    extra: [{ ...actividadVacia }],
  });

  const diasSemana = [
    { key: "lunes", label: "Lunes", emoji: "📅", color: "blue" },
    { key: "martes", label: "Martes", emoji: "📋", color: "green" },
    { key: "miercoles", label: "Miércoles", emoji: "🎯", color: "yellow" },
    { key: "jueves", label: "Jueves", emoji: "⚡", color: "purple" },
    { key: "viernes", label: "Viernes", emoji: "🚀", color: "pink" },
    { key: "sabado", label: "Sábado", emoji: "🎉", color: "indigo" },
    { key: "domingo", label: "Domingo", emoji: "🌟", color: "orange" },
    { key: "extra", label: "Tiempo Extra", emoji: "💎", color: "cyan" },
  ];

  const categorias = [
    { value: "trabajo", label: "Trabajo", icon: "💼", color: "blue" },
    { value: "estudio", label: "Estudio", icon: "📚", color: "green" },
    { value: "ejercicio", label: "Ejercicio", icon: "🏋️", color: "red" },
    { value: "personal", label: "Personal", icon: "🏠", color: "yellow" },
    { value: "social", label: "Social", icon: "👥", color: "purple" },
    { value: "gaming", label: "Gaming", icon: "🎮", color: "pink" },
    { value: "descanso", label: "Descanso", icon: "😴", color: "indigo" },
  ];

  const calcularHoras = (horaInicio: string, horaFin: string): number => {
    if (!horaInicio || !horaFin) return 0;
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    if (fin <= inicio) return 0;
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.round((diferencia / (1000 * 60 * 60)) * 100) / 100;
  };

  const handleActividadChange = (
    dia: string,
    index: number,
    campo: keyof Actividad,
    valor: string | boolean
  ) => {
    setHorarioForm((prev) => {
      const nuevoForm = { ...prev };
      const actividades = [
        ...(nuevoForm[dia as keyof typeof nuevoForm] as Actividad[]),
      ];

      actividades[index] = {
        ...actividades[index],
        [campo]: valor,
      };

      if (campo === "horaInicio" || campo === "horaFin") {
        const horas = calcularHoras(
          campo === "horaInicio"
            ? (valor as string)
            : actividades[index].horaInicio,
          campo === "horaFin" ? (valor as string) : actividades[index].horaFin
        );
        actividades[index].horas = horas;
      }

      return { ...nuevoForm, [dia]: actividades };
    });
  };

  const agregarActividad = (dia: string) => {
    setHorarioForm((prev) => {
      const nuevoForm = { ...prev };
      const actividades = [
        ...(nuevoForm[dia as keyof typeof nuevoForm] as Actividad[]),
      ];
      actividades.push({ ...actividadVacia });
      return { ...nuevoForm, [dia]: actividades };
    });
  };

  const eliminarActividad = (dia: string, index: number) => {
    setHorarioForm((prev) => {
      const nuevoForm = { ...prev };
      const actividades = [
        ...(nuevoForm[dia as keyof typeof nuevoForm] as Actividad[]),
      ];
      if (actividades.length > 1) {
        actividades.splice(index, 1);
      }
      return { ...nuevoForm, [dia]: actividades };
    });
  };

  const calcularTotalHoras = () => {
    let total = 0;
    Object.keys(horarioForm).forEach((key) => {
      if (!["fecha", "titulo", "descripcion"].includes(key)) {
        const actividades = horarioForm[
          key as keyof typeof horarioForm
        ] as Actividad[];
        total += actividades.reduce((sum, act) => {
          return sum + (act.descripcion.trim() !== "" ? act.horas : 0);
        }, 0);
      }
    });
    return Math.round(total * 100) / 100;
  };

  const calcularProgreso = (horario: Horario): number => {
    if (!horario.detalles) return 0;
    let total = 0;
    let completadas = 0;

    Object.values(horario.detalles).forEach((actividades) => {
      actividades.forEach((act) => {
        if (act.descripcion.trim() !== "") {
          total++;
          if (act.completada) completadas++;
        }
      });
    });

    return total > 0 ? Math.round((completadas / total) * 100) : 0;
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "text-red-400 bg-red-500/20";
      case "media":
        return "text-yellow-400 bg-yellow-500/20";
      case "baja":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    const cat = categorias.find((c) => c.value === categoria);
    return cat ? cat.icon : "📋";
  };

  const handleSubmit = async () => {
    if (!user || !horarioForm.titulo.trim()) return;

    setLoading(true);
    try {
      const db = getDatabase();
      const horariosRef = ref(db, `horarios/${user.uid}`);

      const detallesFiltrados: any = {};
      Object.keys(horarioForm).forEach((key) => {
        if (!["fecha", "titulo", "descripcion"].includes(key)) {
          const actividades = horarioForm[
            key as keyof typeof horarioForm
          ] as Actividad[];
          detallesFiltrados[key] = actividades.filter(
            (act) => act.descripcion.trim() !== ""
          );
        }
      });

      const nuevoHorario = {
        titulo: horarioForm.titulo,
        descripcion: horarioForm.descripcion,
        fecha: horarioForm.fecha,
        horas: calcularTotalHoras(),
        detalles: detallesFiltrados,
        userId: user.uid,
        completado: false,
        progreso: 0,
        createdAt: new Date().toISOString(),
      };

      const newHorarioRef = await push(horariosRef, nuevoHorario);
      const horarioCompleto: Horario = {
        ...nuevoHorario,
        _id: newHorarioRef.key!,
      };

      if (onHorarioCreated) {
        onHorarioCreated(horarioCompleto);
      }

      resetForm();
      setShowForm(false);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error al crear horario:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHorarioForm({
      titulo: "",
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
      lunes: [{ ...actividadVacia }],
      martes: [{ ...actividadVacia }],
      miercoles: [{ ...actividadVacia }],
      jueves: [{ ...actividadVacia }],
      viernes: [{ ...actividadVacia }],
      sabado: [{ ...actividadVacia }],
      domingo: [{ ...actividadVacia }],
      extra: [{ ...actividadVacia }],
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    resetForm();
    setCurrentStep(1);
  };

  const toggleCardExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                🕐 Gestión de Horarios
              </h2>
              <p className={`text-lg ${themeClasses.textSecondary}`}>
                Organiza tu tiempo de manera inteligente y productiva
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Stats rápidas */}
              <div
                className={`${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.borderColor}`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {data.length}
                    </div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>
                      Horarios
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.borderColor}`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {data.reduce((total, h) => total + h.horas, 0)}h
                    </div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>
                      Planificadas
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles de vista */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : `${themeClasses.hover} ${themeClasses.textSecondary}`
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : `${themeClasses.hover} ${themeClasses.textSecondary}`
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estado vacío mejorado */}
        {data.length === 0 ? (
          <div
            className={`${themeClasses.cardBg} rounded-2xl p-12 text-center border ${themeClasses.borderColor} shadow-lg`}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-16 h-16 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">
              ¡Comienza a organizar tu tiempo!
            </h3>
            <p
              className={`text-lg ${themeClasses.textSecondary} mb-8 max-w-md mx-auto`}
            >
              Crea tu primer horario personalizado y toma control de tu
              productividad
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Crear Mi Primer Horario
            </button>
          </div>
        ) : (
          /* Lista de horarios mejorada */
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            } gap-6 mb-8`}
          >
            {data.map((horario) => {
              const progreso = calcularProgreso(horario);
              const isExpanded = expandedCards.has(horario._id);

              return (
                <div
                  key={horario._id}
                  className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102`}
                >
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        {horario.titulo ||
                          `Horario ${new Date(
                            horario.fecha
                          ).toLocaleDateString()}`}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          {new Date(horario.fecha).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          progreso === 100
                            ? "bg-green-500/20 text-green-400"
                            : progreso > 50
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {progreso}%
                      </div>
                      <button
                        onClick={() => toggleCardExpanded(horario._id)}
                        className={`${themeClasses.hover} p-1 rounded-lg transition-colors`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Stats rápidas */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div
                      className={`${themeClasses.inputBg} rounded-lg p-3 text-center`}
                    >
                      <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-400">
                        {horario.horas}h
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>
                        Planificadas
                      </div>
                    </div>
                    <div
                      className={`${themeClasses.inputBg} rounded-lg p-3 text-center`}
                    >
                      <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-purple-400">
                        {horario.detalles
                          ? Object.values(horario.detalles)
                              .flat()
                              .filter((a) => a.descripcion.trim()).length
                          : 0}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>
                        Actividades
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className={`w-full bg-gray-600 rounded-full h-2`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          progreso === 100
                            ? "bg-green-500"
                            : progreso > 50
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${progreso}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {horario.descripcion && (
                    <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
                      {horario.descripcion}
                    </p>
                  )}

                  {/* Detalles expandibles */}
                  {isExpanded && horario.detalles && (
                    <div className="space-y-3 mb-4">
                      {Object.entries(horario.detalles).map(
                        ([dia, actividades]) => {
                          const actividadesConDatos = (
                            actividades as Actividad[]
                          ).filter((act) => act.descripcion?.trim() !== "");
                          if (actividadesConDatos.length === 0) return null;

                          const diaInfo = diasSemana.find((d) => d.key === dia);

                          return (
                            <div
                              key={dia}
                              className={`${themeClasses.inputBg} rounded-lg p-3`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">
                                  {diaInfo?.emoji}
                                </span>
                                <span className="font-semibold capitalize">
                                  {diaInfo?.label}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {actividadesConDatos.map((actividad, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">
                                        {getCategoriaIcon(
                                          actividad.categoria || ""
                                        )}
                                      </span>
                                      <span className="font-medium">
                                        {actividad.descripcion}
                                      </span>
                                      {actividad.prioridad && (
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs ${getPrioridadColor(
                                            actividad.prioridad
                                          )}`}
                                        >
                                          {actividad.prioridad}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {actividad.horaInicio &&
                                        actividad.horaFin && (
                                          <span
                                            className={`text-xs ${themeClasses.textSecondary}`}
                                          >
                                            {actividad.horaInicio} -{" "}
                                            {actividad.horaFin}
                                          </span>
                                        )}
                                      <span className="text-xs text-green-400 font-medium">
                                        {actividad.horas}h
                                      </span>
                                      {actividad.completada && (
                                        <span className="text-green-400">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 ${themeClasses.hover} py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button
                      className={`flex-1 ${themeClasses.hover} py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Duplicar</span>
                    </button>
                    <button
                      className={`${themeClasses.hover} p-2 rounded-lg transition-colors`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón flotante mejorado */}
        {!showForm && (
          <div className="fixed bottom-8 right-8 z-40">
            <button
              onClick={() => setShowForm(true)}
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 group"
            >
              <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        )}

        {/* Modal de formulario mejorado con scroll */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className={`${themeClasses.cardBg} rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border ${themeClasses.borderColor}`}
            >
              {/* Header del modal - FIJO */}
              <div
                className={`border-b ${themeClasses.borderColor} p-6 flex-shrink-0`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      ✨ Crear Nuevo Horario
                    </h3>
                    <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                      Paso {currentStep} de 3 -{" "}
                      {currentStep === 1
                        ? "Información básica"
                        : currentStep === 2
                        ? "Planificación semanal"
                        : "Revisión y guardado"}
                    </p>
                  </div>
                  <button
                    onClick={cancelForm}
                    className={`${themeClasses.hover} p-2 rounded-lg transition-colors`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            step <= currentStep
                              ? "bg-blue-600 text-white"
                              : `${themeClasses.inputBg} ${themeClasses.textSecondary}`
                          }`}
                        >
                          {step < currentStep ? "✓" : step}
                        </div>
                        {step < 3 && (
                          <div
                            className={`w-12 h-1 mx-2 rounded ${
                              step < currentStep
                                ? "bg-blue-600"
                                : themeClasses.inputBg
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenido principal - SCROLLABLE */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className="p-6">
                  {/* Paso 1: Información básica */}
                  {currentStep === 1 && (
                    <div className="space-y-8 max-w-2xl mx-auto">
                      <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-12 h-12 text-blue-400" />
                        </div>
                        <h4 className="text-2xl font-bold mb-2">
                          Cuéntanos sobre tu horario
                        </h4>
                        <p className={`${themeClasses.textSecondary}`}>
                          Información básica para personalizar tu experiencia
                        </p>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                        >
                          📝 Título del horario *
                        </label>
                        <input
                          type="text"
                          value={horarioForm.titulo}
                          onChange={(e) =>
                            setHorarioForm((prev) => ({
                              ...prev,
                              titulo: e.target.value,
                            }))
                          }
                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                          placeholder="Ej: Mi Rutina de Productividad Semanal"
                          required
                        />
                        <p
                          className={`text-xs ${themeClasses.textSecondary} mt-1`}
                        >
                          Dale un nombre memorable a tu horario
                        </p>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                        >
                          📄 Descripción (opcional)
                        </label>
                        <textarea
                          value={horarioForm.descripcion}
                          onChange={(e) =>
                            setHorarioForm((prev) => ({
                              ...prev,
                              descripcion: e.target.value,
                            }))
                          }
                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none`}
                          placeholder="Describe brevemente el propósito de este horario..."
                          rows={4}
                        />
                        <p
                          className={`text-xs ${themeClasses.textSecondary} mt-1`}
                        >
                          Explica el objetivo o contexto de este horario
                        </p>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                        >
                          📅 Fecha de inicio *
                        </label>
                        <input
                          type="date"
                          value={horarioForm.fecha}
                          onChange={(e) =>
                            setHorarioForm((prev) => ({
                              ...prev,
                              fecha: e.target.value,
                            }))
                          }
                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-4 py-3 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                          required
                        />
                        <p
                          className={`text-xs ${themeClasses.textSecondary} mt-1`}
                        >
                          Selecciona cuando comenzará este horario
                        </p>
                      </div>

                      <div className={`${themeClasses.inputBg} rounded-lg p-6`}>
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          Consejos para un buen horario
                        </h5>
                        <ul
                          className={`text-sm ${themeClasses.textSecondary} space-y-2`}
                        >
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>
                              Sé específico con los títulos de tus actividades
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span>
                              Incluye descansos entre actividades intensas
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>
                              Asigna prioridades para mejor organización
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>
                              Considera tu nivel de energía en diferentes
                              momentos
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* Indicador de scroll */}
                      <div className="text-center py-4">
                        <p
                          className={`text-xs ${themeClasses.textSecondary} flex items-center justify-center gap-2`}
                        >
                          <ChevronDown className="w-4 h-4 animate-bounce" />
                          Haz scroll para ver más o continúa al siguiente paso
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Paso 2: Planificación semanal - MEJORADO PARA SCROLL */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div
                        className="text-center mb-6 sticky top-0 bg-opacity-95 backdrop-blur-sm pb-4"
                        style={{ backgroundColor: "inherit" }}
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-10 h-10 text-green-400" />
                        </div>
                        <h4 className="text-2xl font-bold mb-2">
                          Planifica tu semana
                        </h4>
                        <p className={`${themeClasses.textSecondary} mb-4`}>
                          Agrega actividades para cada día. Puedes dejar días
                          vacíos si lo deseas.
                        </p>
                        <div
                          className={`inline-flex items-center gap-2 ${themeClasses.inputBg} rounded-lg px-4 py-2`}
                        >
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Total planificado:{" "}
                            <span className="text-green-400">
                              {calcularTotalHoras()}h
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {diasSemana.map(({ key, label, emoji, color }) => (
                          <div
                            key={key}
                            className={`${themeClasses.inputBg} rounded-xl p-6 border ${themeClasses.borderColor}`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold flex items-center gap-2">
                                <span className="text-2xl">{emoji}</span>
                                <span>{label}</span>
                              </h4>
                              <button
                                onClick={() => agregarActividad(key)}
                                className={`text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-500/10`}
                                title="Agregar actividad"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
                              {(
                                horarioForm[
                                  key as keyof typeof horarioForm
                                ] as Actividad[]
                              ).map((actividad, index) => (
                                <div
                                  key={index}
                                  className={`${themeClasses.cardBg} rounded-lg p-4 border ${themeClasses.borderColor}`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span
                                      className={`text-sm font-medium ${themeClasses.textSecondary}`}
                                    >
                                      Actividad {index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {actividad.horas > 0 && (
                                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                                          {actividad.horas}h
                                        </span>
                                      )}
                                      {(
                                        horarioForm[
                                          key as keyof typeof horarioForm
                                        ] as Actividad[]
                                      ).length > 1 && (
                                        <button
                                          onClick={() =>
                                            eliminarActividad(key, index)
                                          }
                                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded"
                                          title="Eliminar actividad"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <input
                                      type="text"
                                      value={actividad.descripcion}
                                      onChange={(e) =>
                                        handleActividadChange(
                                          key,
                                          index,
                                          "descripcion",
                                          e.target.value
                                        )
                                      }
                                      placeholder="¿Qué harás en este tiempo?"
                                      className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-3 py-2 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none text-sm transition-all duration-200`}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label
                                          className={`block text-xs ${themeClasses.textSecondary} mb-1`}
                                        >
                                          🕐 Hora inicio
                                        </label>
                                        <input
                                          type="time"
                                          value={actividad.horaInicio}
                                          onChange={(e) =>
                                            handleActividadChange(
                                              key,
                                              index,
                                              "horaInicio",
                                              e.target.value
                                            )
                                          }
                                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-2 py-2 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none text-sm transition-all duration-200`}
                                        />
                                      </div>

                                      <div>
                                        <label
                                          className={`block text-xs ${themeClasses.textSecondary} mb-1`}
                                        >
                                          🕐 Hora fin
                                        </label>
                                        <input
                                          type="time"
                                          value={actividad.horaFin}
                                          onChange={(e) =>
                                            handleActividadChange(
                                              key,
                                              index,
                                              "horaFin",
                                              e.target.value
                                            )
                                          }
                                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-2 py-2 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none text-sm transition-all duration-200`}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label
                                          className={`block text-xs ${themeClasses.textSecondary} mb-1`}
                                        >
                                          🎯 Prioridad
                                        </label>
                                        <select
                                          value={actividad.prioridad}
                                          onChange={(e) =>
                                            handleActividadChange(
                                              key,
                                              index,
                                              "prioridad",
                                              e.target.value
                                            )
                                          }
                                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-2 py-2 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none text-sm transition-all duration-200`}
                                        >
                                          <option value="baja">🟢 Baja</option>
                                          <option value="media">
                                            🟡 Media
                                          </option>
                                          <option value="alta">🔴 Alta</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label
                                          className={`block text-xs ${themeClasses.textSecondary} mb-1`}
                                        >
                                          📂 Categoría
                                        </label>
                                        <select
                                          value={actividad.categoria}
                                          onChange={(e) =>
                                            handleActividadChange(
                                              key,
                                              index,
                                              "categoria",
                                              e.target.value
                                            )
                                          }
                                          className={`w-full ${themeClasses.inputBg} ${themeClasses.text} px-2 py-2 rounded-lg border ${themeClasses.borderColor} focus:border-blue-500 focus:outline-none text-sm transition-all duration-200`}
                                        >
                                          <option value="">
                                            Sin categoría
                                          </option>
                                          {categorias.map((cat) => (
                                            <option
                                              key={cat.value}
                                              value={cat.value}
                                            >
                                              {cat.icon} {cat.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Indicador de final */}
                      <div className="text-center py-4">
                        <p className={`text-xs ${themeClasses.textSecondary}`}>
                          ✨ Has llegado al final de la planificación semanal
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Paso 3: Revisión - MEJORADO PARA SCROLL */}
                  {currentStep === 3 && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                      <div
                        className="text-center mb-6 sticky top-0 bg-opacity-95 backdrop-blur-sm pb-4"
                        style={{ backgroundColor: "inherit" }}
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-10 h-10 text-purple-400" />
                        </div>
                        <h4 className="text-2xl font-bold mb-2">
                          ¡Casi listo!
                        </h4>
                        <p className={`${themeClasses.textSecondary}`}>
                          Revisa tu horario antes de guardarlo
                        </p>
                      </div>

                      {/* Resumen del horario */}
                      <div
                        className={`${themeClasses.inputBg} rounded-xl p-6 border ${themeClasses.borderColor}`}
                      >
                        <h5 className="text-xl font-bold mb-4">
                          📋 Resumen del Horario
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div
                            className={`${themeClasses.cardBg} rounded-lg p-4 text-center border ${themeClasses.borderColor}`}
                          >
                            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-lg font-bold text-blue-400 truncate">
                              {horarioForm.titulo}
                            </div>
                            <div
                              className={`text-sm ${themeClasses.textSecondary}`}
                            >
                              Título
                            </div>
                          </div>

                          <div
                            className={`${themeClasses.cardBg} rounded-lg p-4 text-center border ${themeClasses.borderColor}`}
                          >
                            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-400">
                              {calcularTotalHoras()}h
                            </div>
                            <div
                              className={`text-sm ${themeClasses.textSecondary}`}
                            >
                              Total planificado
                            </div>
                          </div>

                          <div
                            className={`${themeClasses.cardBg} rounded-lg p-4 text-center border ${themeClasses.borderColor}`}
                          >
                            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-400">
                              {
                                Object.values(horarioForm)
                                  .filter((v) => Array.isArray(v))
                                  .flat()
                                  .filter((a: any) => a.descripcion?.trim())
                                  .length
                              }
                            </div>
                            <div
                              className={`text-sm ${themeClasses.textSecondary}`}
                            >
                              Actividades
                            </div>
                          </div>
                        </div>

                        {horarioForm.descripcion && (
                          <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <h6 className="font-semibold mb-2 text-blue-400">
                              Descripción:
                            </h6>
                            <p
                              className={`${themeClasses.textSecondary} italic`}
                            >
                              {horarioForm.descripcion}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
                          {diasSemana.map(({ key, label, emoji }) => {
                            const actividades = (
                              horarioForm[
                                key as keyof typeof horarioForm
                              ] as Actividad[]
                            ).filter((a) => a.descripcion.trim() !== "");

                            if (actividades.length === 0) return null;

                            return (
                              <div
                                key={key}
                                className={`${themeClasses.cardBg} rounded-lg p-4 border ${themeClasses.borderColor}`}
                              >
                                <h6 className="font-semibold mb-2 flex items-center gap-2">
                                  <span>{emoji}</span>
                                  <span>{label}</span>
                                  <span
                                    className={`text-xs ${themeClasses.textSecondary}`}
                                  >
                                    (
                                    {actividades.reduce(
                                      (sum, a) => sum + a.horas,
                                      0
                                    )}
                                    h)
                                  </span>
                                </h6>
                                <div className="space-y-1">
                                  {actividades.map((act, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {getCategoriaIcon(
                                            act.categoria || ""
                                          )}
                                        </span>
                                        <span className="truncate">
                                          {act.descripcion}
                                        </span>
                                        {act.prioridad && (
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs ${getPrioridadColor(
                                              act.prioridad || ""
                                            )}`}
                                          >
                                            {act.prioridad}
                                          </span>
                                        )}
                                      </div>
                                      <span
                                        className={`${themeClasses.textSecondary} text-xs whitespace-nowrap ml-2`}
                                      >
                                        {act.horaInicio} - {act.horaFin} (
                                        {act.horas}h)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer con navegación - FIJO */}
              <div
                className={`border-t ${themeClasses.borderColor} p-6 flex justify-between items-center flex-shrink-0`}
              >
                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className={`px-6 py-3 rounded-lg font-medium ${themeClasses.inputBg} ${themeClasses.text} ${themeClasses.hover} transition-all duration-200 hover:scale-105 flex items-center gap-2`}
                    >
                      <ChevronUp className="w-4 h-4" />
                      Anterior
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={cancelForm}
                    className={`px-6 py-3 rounded-lg font-medium ${themeClasses.inputBg} ${themeClasses.text} ${themeClasses.hover} transition-all duration-200 hover:scale-105`}
                  >
                    Cancelar
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      disabled={currentStep === 1 && !horarioForm.titulo.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                      <span>Siguiente</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !horarioForm.titulo.trim()}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Crear Horario</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Estilos personalizados para scrollbar */}
      <style>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 6px;
        }
        
        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
        
        .scrollbar-track-gray-700::-webkit-scrollbar-track {
          background-color: #374151;
        }
        
        /* Webkit scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
        }
        
        /* Indicador de scroll más visible */
        .scroll-indicator {
          position: sticky;
          bottom: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 10px 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
