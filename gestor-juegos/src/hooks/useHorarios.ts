import { useState, useEffect } from "react";

// Tipos/interfaces
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
  createdAt?: string;
  updatedAt?: string;
}

// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Funciones para interactuar con la API de MongoDB
const horariosAPI = {
  // Obtener horarios de un usuario
  async getHorarios(userId: string): Promise<Horario[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/horarios?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error obteniendo horarios:", error);
      throw error;
    }
  },

  // Crear nuevo horario
  async createHorario(horario: Omit<Horario, "_id">): Promise<Horario> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(horario),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creando horario:", error);
      throw error;
    }
  },

  // Actualizar horario
  async updateHorario(id: string, horario: Partial<Horario>): Promise<Horario> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(horario),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error actualizando horario:", error);
      throw error;
    }
  },

  // Eliminar horario
  async deleteHorario(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error eliminando horario:", error);
      throw error;
    }
  },
};

// Hook personalizado para gestionar horarios
export const useHorarios = (userId: string) => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHorarios = async () => {
    if (!userId) {
      setHorarios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando horarios para userId:", userId);
      const data = await horariosAPI.getHorarios(userId);
      console.log("✅ Horarios cargados:", data);
      setHorarios(data);
    } catch (err) {
      console.error("❌ Error cargando horarios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createHorario = async (horario: Omit<Horario, "_id">) => {
    try {
      console.log("📝 Creando horario:", horario);
      const nuevoHorario = await horariosAPI.createHorario(horario);
      console.log("✅ Horario creado:", nuevoHorario);

      // Actualizar el estado local inmediatamente
      setHorarios((prev) => {
        const updated = [nuevoHorario, ...prev];
        console.log("🔄 Estado actualizado, total horarios:", updated.length);
        return updated;
      });

      return nuevoHorario;
    } catch (err) {
      console.error("❌ Error creando horario:", err);
      throw err;
    }
  };

  const updateHorario = async (id: string, updates: Partial<Horario>) => {
    try {
      console.log("📝 Actualizando horario:", id, updates);
      const horarioActualizado = await horariosAPI.updateHorario(id, updates);
      console.log("✅ Horario actualizado:", horarioActualizado);

      setHorarios((prev) =>
        prev.map((h) => (h._id === id ? horarioActualizado : h))
      );
      return horarioActualizado;
    } catch (err) {
      console.error("❌ Error actualizando horario:", err);
      throw err;
    }
  };

  const deleteHorario = async (id: string) => {
    try {
      console.log("🗑️ Eliminando horario:", id);
      await horariosAPI.deleteHorario(id);
      console.log("✅ Horario eliminado");

      setHorarios((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("❌ Error eliminando horario:", err);
      throw err;
    }
  };

  // Cargar horarios al montar o cambiar userId
  useEffect(() => {
    if (userId) {
      console.log("🚀 useEffect triggered, cargando horarios para:", userId);
      loadHorarios();
    } else {
      console.log("⚠️ No userId provided, clearing horarios");
      setHorarios([]);
      setLoading(false);
    }
  }, [userId]); // Solo dependemos de userId

  return {
    horarios,
    loading,
    error,
    loadHorarios,
    createHorario,
    updateHorario,
    deleteHorario,
  };
};

// Exportar tipos para uso en otros componentes
export type { Horario, Actividad };
