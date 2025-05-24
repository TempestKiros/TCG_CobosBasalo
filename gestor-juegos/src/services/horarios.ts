// hooks/useHorarios.ts - Hook actualizado para usar el backend
import { useState, useEffect } from "react";
import { User } from "firebase/auth";

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
  createdAt: string;
  updatedAt?: string;
}

// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Función auxiliar para manejar respuestas de la API
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error HTTP: ${response.status}`);
  }
  return response.json();
};

// Función auxiliar para hacer peticiones con manejo de errores
const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`Error en petición a ${url}:`, error);
    throw error;
  }
};

export const useHorarios = (user: User | null) => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar horarios del usuario
  const fetchHorarios = async () => {
    if (!user) {
      setHorarios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiRequest(`/api/horarios?userId=${user.uid}`);
      setHorarios(data);
    } catch (err) {
      console.error("Error al cargar horarios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo horario
  const crearHorario = async (
    nuevoHorario: Omit<Horario, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const horarioCreado = await apiRequest("/api/horarios", {
        method: "POST",
        body: JSON.stringify(nuevoHorario),
      });

      // Actualizar la lista local
      setHorarios((prev) => [horarioCreado, ...prev]);

      return horarioCreado;
    } catch (err) {
      console.error("Error al crear horario:", err);
      throw err;
    }
  };

  // Actualizar horario existente
  const actualizarHorario = async (
    id: string,
    datosActualizacion: Partial<Horario>
  ) => {
    try {
      const horarioActualizado = await apiRequest(`/api/horarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(datosActualizacion),
      });

      // Actualizar la lista local
      setHorarios((prev) =>
        prev.map((h) => (h._id === id ? horarioActualizado : h))
      );

      return horarioActualizado;
    } catch (err) {
      console.error("Error al actualizar horario:", err);
      throw err;
    }
  };

  // Eliminar horario
  const eliminarHorario = async (id: string) => {
    try {
      await apiRequest(`/api/horarios/${id}`, {
        method: "DELETE",
      });

      // Actualizar la lista local
      setHorarios((prev) => prev.filter((h) => h._id !== id));

      return true;
    } catch (err) {
      console.error("Error al eliminar horario:", err);
      throw err;
    }
  };

  // Duplicar horario
  const duplicarHorario = async (horario: Horario) => {
    const nuevoHorario = {
      ...horario,
      titulo: `${horario.titulo} (Copia)`,
      fecha: new Date().toISOString().split("T")[0],
      completado: false,
      progreso: 0,
      userId: user?.uid || "",
    };

    // Remover campos que se generan automáticamente
    delete (nuevoHorario as any)._id;
    delete (nuevoHorario as any).createdAt;
    delete (nuevoHorario as any).updatedAt;

    return await crearHorario(nuevoHorario);
  };

  // Obtener estadísticas del usuario
  const obtenerEstadisticas = async () => {
    if (!user) return null;

    try {
      const stats = await apiRequest(`/api/stats/${user.uid}`);
      return stats;
    } catch (err) {
      console.error("Error al obtener estadísticas:", err);
      return null;
    }
  };

  // Cargar horarios cuando el usuario cambie
  useEffect(() => {
    fetchHorarios();
  }, [user]);

  return {
    horarios,
    loading,
    error,
    fetchHorarios,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
    duplicarHorario,
    obtenerEstadisticas,
    refetch: fetchHorarios,
  };
};

// Hook adicional para estadísticas
export const useEstadisticas = (user: User | null) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = async () => {
    if (!user) {
      setEstadisticas(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const stats = await apiRequest(`/api/stats/${user.uid}`);
      setEstadisticas(stats);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [user]);

  return {
    estadisticas,
    loading,
    error,
    refetch: fetchEstadisticas,
  };
};
