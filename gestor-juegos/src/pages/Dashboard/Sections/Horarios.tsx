import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { getDatabase, ref, push, get, set } from "firebase/database";
import { Plus, Calendar, Clock, Save, X, Trash2 } from "lucide-react";

interface Actividad {
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
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
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const actividadVacia: Actividad = {
    descripcion: "",
    horaInicio: "",
    horaFin: "",
    horas: 0,
  };

  const [horarioForm, setHorarioForm] = useState({
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
    { key: "lunes", label: "Lunes" },
    { key: "martes", label: "Martes" },
    { key: "miercoles", label: "Miércoles" },
    { key: "jueves", label: "Jueves" },
    { key: "viernes", label: "Viernes" },
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" },
    { key: "extra", label: "Extra" },
  ];

  const calcularHoras = (horaInicio: string, horaFin: string): number => {
    if (!horaInicio || !horaFin) return 0;

    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);

    if (fin <= inicio) return 0;

    const diferencia = fin.getTime() - inicio.getTime();
    return diferencia / (1000 * 60 * 60); // Convertir a horas
  };

  const handleActividadChange = (
    dia: string,
    index: number,
    campo: keyof Actividad,
    valor: string
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

      // Si se cambian las horas, recalcular automáticamente
      if (campo === "horaInicio" || campo === "horaFin") {
        const horas = calcularHoras(
          campo === "horaInicio" ? valor : actividades[index].horaInicio,
          campo === "horaFin" ? valor : actividades[index].horaFin
        );
        actividades[index].horas = Math.round(horas * 100) / 100; // Redondear a 2 decimales
      }

      return {
        ...nuevoForm,
        [dia]: actividades,
      };
    });
  };

  const agregarActividad = (dia: string) => {
    setHorarioForm((prev) => {
      const nuevoForm = { ...prev };
      const actividades = [
        ...(nuevoForm[dia as keyof typeof nuevoForm] as Actividad[]),
      ];
      actividades.push({ ...actividadVacia });

      return {
        ...nuevoForm,
        [dia]: actividades,
      };
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

      return {
        ...nuevoForm,
        [dia]: actividades,
      };
    });
  };

  const calcularTotalHoras = () => {
    let total = 0;
    Object.keys(horarioForm).forEach((key) => {
      if (key !== "fecha") {
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

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const db = getDatabase();
      const horariosRef = ref(db, `horarios/${user.uid}`);

      // Filtrar actividades vacías antes de guardar
      const detallesFiltrados: any = {};
      Object.keys(horarioForm).forEach((key) => {
        if (key !== "fecha") {
          const actividades = horarioForm[
            key as keyof typeof horarioForm
          ] as Actividad[];
          detallesFiltrados[key] = actividades.filter(
            (act) => act.descripcion.trim() !== ""
          );
        }
      });

      const nuevoHorario = {
        fecha: horarioForm.fecha,
        horas: calcularTotalHoras(),
        detalles: detallesFiltrados,
        userId: user.uid,
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

      // Reset form
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error al crear horario:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHorarioForm({
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
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Horarios Generados
            </h2>
            <p className="text-gray-400">
              Gestiona y crea tus horarios semanales
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">
              {data.length} horario{data.length !== 1 ? "s" : ""} creado
              {data.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Lista de horarios existentes */}
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No tienes horarios guardados
            </h3>
            <p className="text-gray-500 mb-6">
              Crea tu primer horario semanal para organizar mejor tu tiempo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.map((horario) => (
              <div
                key={horario._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-lg font-semibold">
                      {new Date(horario.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {horario.horas}h
                    </span>
                  </div>
                </div>

                {horario.detalles && (
                  <div className="space-y-3">
                    {Object.entries(horario.detalles).map(
                      ([dia, actividades]) => {
                        const actividadesConDatos = (
                          (actividades as Actividad[]) || []
                        ).filter((act) => act.descripcion?.trim() !== "");
                        if (actividadesConDatos.length === 0) return null;

                        return (
                          <div key={dia} className="text-sm">
                            <span className="text-blue-400 capitalize font-medium">
                              {dia}:
                            </span>
                            <div className="ml-4 mt-1 space-y-1">
                              {actividadesConDatos.map((actividad, idx) => (
                                <div key={idx} className="text-gray-300">
                                  <span className="font-medium">
                                    {actividad.descripcion}
                                  </span>
                                  {actividad.horaInicio &&
                                    actividad.horaFin && (
                                      <span className="text-gray-400 ml-2">
                                        ({actividad.horaInicio} -{" "}
                                        {actividad.horaFin}) - {actividad.horas}
                                        h
                                      </span>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón flotante para crear nuevo horario */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Modal de formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Crear Nuevo Horario
                  </h3>
                  <button
                    onClick={cancelForm}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha del horario
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
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {diasSemana.map(({ key, label }) => (
                      <div key={key} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-white">
                            {label}
                          </h4>
                          <button
                            onClick={() => agregarActividad(key)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Agregar actividad"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(
                            horarioForm[
                              key as keyof typeof horarioForm
                            ] as Actividad[]
                          ).map((actividad, index) => (
                            <div
                              key={index}
                              className="bg-gray-600 p-3 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300">
                                  Actividad {index + 1}
                                </span>
                                {(
                                  horarioForm[
                                    key as keyof typeof horarioForm
                                  ] as Actividad[]
                                ).length > 1 && (
                                  <button
                                    onClick={() =>
                                      eliminarActividad(key, index)
                                    }
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Eliminar actividad"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="space-y-2">
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
                                  placeholder="Descripción de la actividad"
                                  className="w-full bg-gray-500 text-white px-3 py-2 rounded border border-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                      Hora inicio
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
                                      className="w-full bg-gray-500 text-white px-2 py-1 rounded border border-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                      Hora fin
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
                                      className="w-full bg-gray-500 text-white px-2 py-1 rounded border border-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                                    />
                                  </div>
                                </div>

                                {actividad.horas > 0 && (
                                  <div className="text-xs text-green-400 text-center">
                                    Duración: {actividad.horas} horas
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">
                        Total de horas programadas:
                      </span>
                      <span className="text-green-400 font-semibold text-lg">
                        {calcularTotalHoras()} horas
                      </span>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Guardar Horario</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelForm}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
