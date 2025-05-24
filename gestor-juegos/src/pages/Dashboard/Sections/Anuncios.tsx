// src/pages/Dashboard/Sections/Anuncios.tsx
import React, { useState, useEffect } from "react";
import { useTheme } from "./contexts/SettingsContext";
import {
  Search,
  ExternalLink,
  Clock,
  Filter,
  Zap,
  Gift,
  Gamepad2,
  Cpu,
  Users,
} from "lucide-react";

interface Noticia {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  categoria: string;
  enlace: string;
  fechaPublicacion: Date;
  autor?: string;
  likes?: number;
}

export const Anuncios: React.FC = () => {
  const [noticias] = useState<Noticia[]>([
    {
      id: 1,
      titulo: "GTA VI confirma su lanzamiento para 2025",
      descripcion:
        "Rockstar Games revela nuevos detalles sobre el esperado Grand Theft Auto VI, confirmando su llegada en 2025 con gráficos de nueva generación.",
      imagen:
        "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 2 horas",
      categoria: "Noticias",
      enlace: "https://www.rockstargames.com/gta-vi",
      fechaPublicacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
      autor: "Rockstar Games",
      likes: 2547,
    },
    {
      id: 2,
      titulo: "Elden Ring: Shadow of the Erdtree - Nueva expansión",
      descripcion:
        "FromSoftware anuncia una masiva expansión que promete 40+ horas de contenido adicional con nuevos jefes épicos.",
      imagen:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 4 horas",
      categoria: "DLC",
      enlace: "https://en.bandainamcoent.eu/elden-ring",
      fechaPublicacion: new Date(Date.now() - 4 * 60 * 60 * 1000),
      autor: "FromSoftware",
      likes: 3421,
    },
    {
      id: 3,
      titulo: "Steam Deck OLED ya disponible",
      descripcion:
        "Valve lanza la nueva versión OLED de Steam Deck con mejor pantalla, mayor duración de batería y rendimiento optimizado.",
      imagen:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 6 horas",
      categoria: "Hardware",
      enlace: "https://store.steampowered.com/steamdeck",
      fechaPublicacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
      autor: "Valve Corporation",
      likes: 1876,
    },
    {
      id: 4,
      titulo: "PlayStation 5 Pro oficialmente anunciada",
      descripcion:
        "Sony revela la versión Pro de PS5 con soporte para 8K, ray tracing mejorado y GPU más potente para experiencias premium.",
      imagen:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 8 horas",
      categoria: "Consolas",
      enlace: "https://www.playstation.com/es-es/ps5/",
      fechaPublicacion: new Date(Date.now() - 8 * 60 * 60 * 1000),
      autor: "Sony Interactive",
      likes: 2198,
    },
    {
      id: 5,
      titulo: "Ofertas de Steam: -75% en juegos AAA",
      descripcion:
        "Gran oferta de primavera con descuentos masivos en Red Dead Redemption 2, Cyberpunk 2077, The Witcher 3 y más títulos épicos.",
      imagen:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 1 día",
      categoria: "Ofertas",
      enlace: "https://store.steampowered.com/",
      fechaPublicacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
      autor: "Steam Store",
      likes: 4532,
    },
    {
      id: 6,
      titulo: "Epic Games regala Borderlands 3",
      descripcion:
        "El popular shooter looter estará disponible gratuitamente por tiempo limitado en Epic Games Store junto con todos sus DLC.",
      imagen:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 1 día",
      categoria: "Gratis",
      enlace: "https://store.epicgames.com/",
      fechaPublicacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
      autor: "Epic Games",
      likes: 5671,
    },
    {
      id: 7,
      titulo: "Call of Duty: Modern Warfare 3 - Nuevo mapa",
      descripcion:
        "Activision presenta el nuevo mapa multijugador 'Nuketown Remastered' con gráficos actualizados y mecánicas mejoradas.",
      imagen:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 2 días",
      categoria: "Actualización",
      enlace: "https://www.callofduty.com/",
      fechaPublicacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      autor: "Activision",
      likes: 1987,
    },
    {
      id: 8,
      titulo: "Nintendo Direct anunciado para marzo",
      descripcion:
        "Nintendo confirma un nuevo Direct con anuncios sobre Zelda, Mario y posible información sobre la próxima consola.",
      imagen:
        "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 3 días",
      categoria: "Eventos",
      enlace: "https://www.nintendo.com/",
      fechaPublicacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      autor: "Nintendo",
      likes: 3254,
    },
  ]);

  const [noticiasFiltradas, setNoticiasFiltradas] =
    useState<Noticia[]>(noticias);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [ordenPor, setOrdenPor] = useState("recientes");
  const { theme, themeClasses } = useTheme();

  // Obtener categorías únicas para el filtro
  const categoriasUnicas = [
    "Todas",
    ...Array.from(new Set(noticias.map((noticia) => noticia.categoria))),
  ];

  // Filtrar y ordenar noticias
  useEffect(() => {
    let noticiasFiltradas = noticias;

    // Filtro por búsqueda
    if (busqueda) {
      noticiasFiltradas = noticiasFiltradas.filter(
        (noticia) =>
          noticia.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          noticia.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
          noticia.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
          noticia.autor?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== "Todas") {
      noticiasFiltradas = noticiasFiltradas.filter(
        (noticia) => noticia.categoria === filtroCategoria
      );
    }

    // Ordenar noticias
    noticiasFiltradas.sort((a, b) => {
      switch (ordenPor) {
        case "populares":
          return (b.likes || 0) - (a.likes || 0);
        case "antiguas":
          return a.fechaPublicacion.getTime() - b.fechaPublicacion.getTime();
        case "recientes":
        default:
          return b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime();
      }
    });

    setNoticiasFiltradas(noticiasFiltradas);
  }, [busqueda, filtroCategoria, ordenPor, noticias]);

  const manejarClickNoticia = (enlace: string) => {
    window.open(enlace, "_blank", "noopener,noreferrer");
  };

  const getCategoriaColor = (categoria: string) => {
    const colores: { [key: string]: string } = {
      Noticias: "#3b82f6",
      DLC: "#10b981",
      Hardware: "#f59e0b",
      Consolas: "#8b5cf6",
      Ofertas: "#ef4444",
      Gratis: "#06d6a0",
      Actualización: "#6366f1",
      Eventos: "#ec4899",
    };
    return colores[categoria] || "#6b7280";
  };

  const getCategoriaIcon = (categoria: string) => {
    const iconos: { [key: string]: React.ReactNode } = {
      Noticias: <Gamepad2 className="w-3 h-3" />,
      DLC: <Zap className="w-3 h-3" />,
      Hardware: <Cpu className="w-3 h-3" />,
      Consolas: <Gamepad2 className="w-3 h-3" />,
      Ofertas: <Gift className="w-3 h-3" />,
      Gratis: <Gift className="w-3 h-3" />,
      Actualización: <Zap className="w-3 h-3" />,
      Eventos: <Users className="w-3 h-3" />,
    };
    return iconos[categoria] || <Gamepad2 className="w-3 h-3" />;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-400">
            🎮 Noticias y Ofertas Gaming
          </h1>
          <p className="text-gray-400">
            Mantente al día con las últimas noticias, ofertas y actualizaciones
            del mundo gaming
          </p>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 bg-gray-800 p-4 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar noticias, ofertas, desarrolladores..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[120px]"
              >
                {categoriasUnicas.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={ordenPor}
              onChange={(e) => setOrdenPor(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="recientes">Más recientes</option>
              <option value="populares">Más populares</option>
              <option value="antiguas">Más antiguas</option>
            </select>
          </div>
        </div>

        {/* Grid de noticias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {noticiasFiltradas.map((noticia) => (
            <div
              key={noticia.id}
              onClick={() => manejarClickNoticia(noticia.enlace)}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-gray-700 hover:border-blue-500/50"
            >
              {/* Imagen */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={noticia.imagen}
                  alt={noticia.titulo}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Categoría badge */}
                <div
                  className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg"
                  style={{
                    backgroundColor: getCategoriaColor(noticia.categoria),
                  }}
                >
                  {getCategoriaIcon(noticia.categoria)}
                  {noticia.categoria}
                </div>

                {/* Likes */}
                {noticia.likes && (
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                    ❤️ {noticia.likes.toLocaleString()}
                  </div>
                )}

                {/* Fecha en la imagen */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                  <Clock className="w-3 h-3" />
                  {noticia.fecha}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight hover:text-blue-400 transition-colors duration-200">
                    {noticia.titulo}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                    {noticia.descripcion}
                  </p>
                </div>

                {/* Autor y botón */}
                <div className="flex items-center justify-between">
                  {noticia.autor && (
                    <div className="text-xs text-gray-500">
                      Por{" "}
                      <span className="text-gray-400 font-medium">
                        {noticia.autor}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors duration-200">
                    <span>Leer más</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay resultados */}
        {noticiasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
            <p className="text-gray-400 text-lg mb-2">
              No se encontraron noticias
            </p>
            <p className="text-gray-500 text-sm">
              Intenta con otros términos de búsqueda o cambia los filtros
            </p>
          </div>
        )}

        {/* Botón para ver más (solo si hay resultados) */}
        {noticiasFiltradas.length > 0 && (
          <div className="text-center mt-8 pt-6 border-t border-gray-700">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
              <Gamepad2 className="w-5 h-5" />
              Cargar más noticias
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
