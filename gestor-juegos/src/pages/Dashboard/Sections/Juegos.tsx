// src/pages/Dashboard/Sections/Juegos.tsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Heart,
  ExternalLink,
  MessageSquare,
  Clock,
  Star,
} from "lucide-react";
import {
  ref,
  set,
  get,
  update,
  onValue,
  serverTimestamp,
} from "firebase/database";
import { useTheme } from "./contexts/SettingsContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, database } from "../../../firebase/config";

// Interfaz para los juegos
interface Juego {
  id: string;
  nombre: string;
  desarrollador: string;
  genero: string[];
  precio: number;
  descuento?: number;
  imagen: string;
  steamUrl: string;
  descripcion: string;
  fechaLanzamiento: string;
  calificacion: number;
  tieneForo: boolean;
}

// Interfaz para datos del usuario
interface DatosUsuarioJuego {
  horasJugadas: number;
  esFavorito: boolean;
  miembroForo: boolean;
  fechaAgregado: any;
}

// Base de datos mock de juegos
export const juegosBaseDatos: Juego[] = [
  {
    id: "hollow_knight",
    nombre: "Hollow Knight",
    desarrollador: "Team Cherry",
    genero: ["Metroidvania", "Indie", "Acción"],
    precio: 14.99,
    descuento: 50,
    imagen: "https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg",
    steamUrl: "https://store.steampowered.com/app/367520/Hollow_Knight/",
    descripcion:
      "Forja tu propio camino en Hollow Knight, una aventura épica en un reino en ruinas de insectos y héroes.",
    fechaLanzamiento: "2017-02-24",
    calificacion: 4.9,
    tieneForo: true,
  },
  {
    id: "fortnite",
    nombre: "Fortnite",
    desarrollador: "Epic Games",
    genero: ["Battle Royale", "Acción", "Multijugador"],
    precio: 0,
    imagen:
      "https://primagames.com/wp-content/uploads/2022/12/FortniteChapter4Start.jpg",
    steamUrl: "https://store.epicgames.com/es-ES/p/fortnite",
    descripcion:
      "Fortnite es el juego de supervivencia multijugador completamente gratuito donde tú y tus amigos colaboran para crear el mundo de sus sueños.",
    fechaLanzamiento: "2017-07-25",
    calificacion: 4.2,
    tieneForo: true,
  },
  {
    id: "honkai_star_rail",
    nombre: "Honkai Star Rail",
    desarrollador: "HoYoverse",
    genero: ["RPG", "Turn-Based", "Anime"],
    precio: 0,
    imagen: "https://spaces.whynowgaming.com/uploads/2023/04/honkai.jpg",
    steamUrl: "https://hsr.hoyoverse.com/es-es/home",
    descripcion:
      "Embárcate en una aventura galáctica como Pionero para explorar mundos alienígenas con compañeros únicos.",
    fechaLanzamiento: "2023-04-26",
    calificacion: 4.6,
    tieneForo: true,
  },
  {
    id: "arknights",
    nombre: "Arknights",
    desarrollador: "Hypergryph",
    genero: ["Tower Defense", "Strategy", "Anime"],
    precio: 0,
    imagen:
      "https://cf.geekdo-images.com/tHP2pCtFQ7MNWJKZJAKwpw__opengraph_letterbox/img/EYbZ3X31MduVwegRDrf7942WAKA=/fit-in/1200x630/filters:fill(auto):strip_icc()/pic5327886.png",
    steamUrl: "https://store.steampowered.com/app/1454663/Arknights/",
    descripcion:
      "Un juego de defensa de torres estratégico con elementos de RPG y una historia profunda.",
    fechaLanzamiento: "2019-05-01",
    calificacion: 4.4,
    tieneForo: true,
  },
  {
    id: "fifa_24",
    nombre: "FIFA 24",
    desarrollador: "EA Sports",
    genero: ["Deportes", "Simulación", "Multijugador"],
    precio: 59.99,
    descuento: 25,
    imagen:
      "https://imgs.hipertextual.com/wp-content/uploads/2023/07/fc-24-scaled.jpg",
    steamUrl: "https://store.steampowered.com/app/2195250/EA_SPORTS_FC_24/",
    descripcion:
      "El juego de fútbol más realista con los equipos y jugadores más actualizados.",
    fechaLanzamiento: "2023-09-29",
    calificacion: 4.1,
    tieneForo: true,
  },
  {
    id: "witcher_3",
    nombre: "The Witcher 3: Wild Hunt",
    desarrollador: "CD Projekt RED",
    genero: ["RPG", "Aventura", "Mundo Abierto"],
    precio: 39.99,
    descuento: 70,
    imagen: "https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg",
    steamUrl:
      "https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/",
    descripcion:
      "Un RPG de mundo abierto épico con una narrativa madura en un universo fantástico.",
    fechaLanzamiento: "2015-05-18",
    calificacion: 4.8,
    tieneForo: false,
  },
  {
    id: "overwatch_2",
    nombre: "Overwatch 2",
    desarrollador: "Blizzard Entertainment",
    genero: ["FPS", "Héroe Shooter", "Multijugador"],
    precio: 0,
    imagen: "https://nerdbot.com/wp-content/uploads/2019/11/overwat-2.jpg",
    steamUrl: "https://playoverwatch.com/",
    descripcion:
      "Un shooter de héroes en equipo donde cada jugador tiene un papel crucial en la victoria.",
    fechaLanzamiento: "2022-10-04",
    calificacion: 4.0,
    tieneForo: false,
  },
  {
    id: "cyberpunk_2077",
    nombre: "Cyberpunk 2077",
    desarrollador: "CD Projekt RED",
    genero: ["RPG", "Acción", "Cyberpunk"],
    precio: 59.99,
    descuento: 50,
    imagen: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
    steamUrl: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
    descripcion:
      "Un RPG de acción y aventura de mundo abierto ambientado en Night City.",
    fechaLanzamiento: "2020-12-10",
    calificacion: 4.3,
    tieneForo: false,
  },
];

export const Juegos: React.FC<{
  onNavigateToSection?: (section: string) => void;
}> = ({ onNavigateToSection }) => {
  const [user, loading] = useAuthState(auth);
  const [juegos] = useState<Juego[]>(juegosBaseDatos);
  const [juegosFiltrados, setJuegosFiltrados] =
    useState<Juego[]>(juegosBaseDatos);
  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("Todos");
  const [modalHoras, setModalHoras] = useState<string | null>(null);
  const [nuevasHoras, setNuevasHoras] = useState<number>(0);
  const [modalForo, setModalForo] = useState<string | null>(null);

  // Usar el hook de theme de tu contexto correcto
  const { theme, themeClasses } = useTheme();

  // Estados para datos de Firebase
  const [datosUsuario, setDatosUsuario] = useState<
    Record<string, DatosUsuarioJuego>
  >({});
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Obtener géneros únicos para el filtro
  const generosUnicos = [
    "Todos",
    ...Array.from(new Set(juegos.flatMap((juego) => juego.genero))),
  ];

  // Cargar datos del usuario desde Firebase Realtime Database
  useEffect(() => {
    if (!user) {
      setCargandoDatos(false);
      return;
    }

    const cargarDatosUsuario = async () => {
      try {
        const usuarioRef = ref(database, `usuarios/${user.uid}/juegos`);
        const snapshot = await get(usuarioRef);

        if (snapshot.exists()) {
          setDatosUsuario(snapshot.val());
        } else {
          // Crear datos iniciales para todos los juegos
          const datosIniciales: Record<string, DatosUsuarioJuego> = {};

          juegos.forEach((juego) => {
            datosIniciales[juego.id] = {
              horasJugadas: 0,
              esFavorito: false,
              miembroForo: false,
              fechaAgregado: serverTimestamp(),
            };
          });

          await set(usuarioRef, datosIniciales);
          setDatosUsuario(datosIniciales);
        }

        setCargandoDatos(false);
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        setCargandoDatos(false);
      }
    };

    cargarDatosUsuario();

    // Listener en tiempo real para cambios
    const usuarioRef = ref(database, `usuarios/${user.uid}/juegos`);
    const unsubscribe = onValue(usuarioRef, (snapshot) => {
      if (snapshot.exists()) {
        setDatosUsuario(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [user, juegos]);

  // Filtrar juegos basado en búsqueda y género
  useEffect(() => {
    let juegosFiltrados = juegos;

    // Filtro por búsqueda
    if (busqueda) {
      juegosFiltrados = juegosFiltrados.filter(
        (juego) =>
          juego.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          juego.desarrollador.toLowerCase().includes(busqueda.toLowerCase()) ||
          juego.genero.some((g) =>
            g.toLowerCase().includes(busqueda.toLowerCase())
          )
      );
    }

    // Filtro por género
    if (filtroGenero !== "Todos") {
      juegosFiltrados = juegosFiltrados.filter((juego) =>
        juego.genero.includes(filtroGenero)
      );
    }

    setJuegosFiltrados(juegosFiltrados);
  }, [busqueda, filtroGenero, juegos]);

  // Función para actualizar datos en Firebase Realtime Database
  const actualizarDatosFirebase = async (
    juegoId: string,
    datosActualizados: Partial<DatosUsuarioJuego>
  ) => {
    if (!user) return;

    try {
      const juegoRef = ref(database, `usuarios/${user.uid}/juegos/${juegoId}`);
      await update(juegoRef, {
        ...datosActualizados,
        fechaActualizacion: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error actualizando datos:", error);
    }
  };

  // Manejar favoritos
  const toggleFavorito = async (juegoId: string) => {
    const esFavorito = !(datosUsuario[juegoId]?.esFavorito || false);
    await actualizarDatosFirebase(juegoId, { esFavorito });
  };

  // Actualizar horas jugadas
  const actualizarHoras = async (juegoId: string, horas: number) => {
    await actualizarDatosFirebase(juegoId, { horasJugadas: horas });
    setModalHoras(null);
    setNuevasHoras(0);
  };

  // Manejar membresía de foro
  const toggleMiembroForo = async (juegoId: string) => {
    const miembroForo = !(datosUsuario[juegoId]?.miembroForo || false);
    await actualizarDatosFirebase(juegoId, { miembroForo });
    setModalForo(null);
  };

  // Navegar al foro del juego
  const navegarAForoJuego = async (juegoId: string, nombreJuego: string) => {
    // Primero, asegurarse de que el usuario es miembro del foro
    const datosJuego = datosUsuario[juegoId];
    if (!datosJuego?.miembroForo) {
      await actualizarDatosFirebase(juegoId, { miembroForo: true });
    }

    // Si tenemos session storage, guardar el juego seleccionado
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(
        "selectedGameForForum",
        JSON.stringify({
          id: juegoId,
          name: nombreJuego,
        })
      );
    }

    // Navegar a la sección de foros
    if (onNavigateToSection) {
      onNavigateToSection("foros");
    }
  };

  // Calcular precio con descuento
  const calcularPrecio = (precio: number, descuento?: number) => {
    if (precio === 0) return "Gratis";
    if (descuento) {
      const precioDescuento = precio * (1 - descuento / 100);
      return `$${precioDescuento.toFixed(2)}`;
    }
    return `$${precio.toFixed(2)}`;
  };

  // Mostrar loading si no hay usuario o se están cargando datos
  if (loading || cargandoDatos) {
    return (
      <div
        className={`p-6 ${themeClasses.bg} min-h-screen ${themeClasses.text} flex items-center justify-center transition-colors duration-300`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className={themeClasses.textSecondary}>
            Cargando tu biblioteca...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay usuario
  if (!user) {
    return (
      <div
        className={`p-6 ${themeClasses.bg} min-h-screen ${themeClasses.text} flex items-center justify-center transition-colors duration-300`}
      >
        <div className="text-center">
          <p className={`${themeClasses.textSecondary} text-lg`}>
            Inicia sesión para ver tu biblioteca de juegos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 ${themeClasses.bg} min-h-screen ${themeClasses.text} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-400">
            Mi Biblioteca de Juegos
          </h1>
          <p className={themeClasses.textSecondary}>
            Explora, organiza y disfruta tu colección de juegos
          </p>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div
          className={`mb-6 flex flex-col md:flex-row gap-4 ${themeClasses.cardBg} p-4 rounded-lg border ${themeClasses.borderColor}`}
        >
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} w-5 h-5`}
            />
            <input
              type="text"
              placeholder="Buscar juegos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${themeClasses.inputBg} border ${themeClasses.borderColor} rounded-md ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200`}
            />
          </div>
          <select
            value={filtroGenero}
            onChange={(e) => setFiltroGenero(e.target.value)}
            className={`px-4 py-2 ${themeClasses.inputBg} border ${themeClasses.borderColor} rounded-md ${themeClasses.text} focus:outline-none focus:border-blue-500 transition-colors duration-200`}
          >
            {generosUnicos.map((genero) => (
              <option key={genero} value={genero}>
                {genero}
              </option>
            ))}
          </select>
        </div>

        {/* Grid de juegos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {juegosFiltrados.map((juego) => {
            const datosJuego = datosUsuario[juego.id] || {
              horasJugadas: 0,
              esFavorito: false,
              miembroForo: false,
              fechaAgregado: null,
            };

            return (
              <div
                key={juego.id}
                className={`${themeClasses.cardBg} rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${themeClasses.borderColor}`}
              >
                {/* Imagen del juego */}
                <div className="relative">
                  <img
                    src={juego.imagen}
                    alt={juego.nombre}
                    className="w-full h-48 object-cover"
                  />
                  {juego.descuento && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">
                      -{juego.descuento}%
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorito(juego.id)}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 ${
                      datosJuego.esFavorito
                        ? "bg-red-600 text-white"
                        : `${themeClasses.hover} ${themeClasses.textSecondary}`
                    }`}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={datosJuego.esFavorito ? "currentColor" : "none"}
                    />
                  </button>
                  {datosJuego.miembroForo && juego.tieneForo && (
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Miembro del Foro
                    </div>
                  )}
                </div>

                {/* Contenido del juego */}
                <div className="p-4">
                  <h3 className={`text-xl font-bold mb-1 ${themeClasses.text}`}>
                    {juego.nombre}
                  </h3>
                  <p className={`${themeClasses.textSecondary} text-sm mb-2`}>
                    {juego.desarrollador}
                  </p>

                  {/* Géneros */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {juego.genero.slice(0, 2).map((genero) => (
                      <span
                        key={genero}
                        className="px-2 py-1 bg-blue-600 text-xs rounded text-white"
                      >
                        {genero}
                      </span>
                    ))}
                  </div>

                  {/* Calificación */}
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span
                      className={`ml-1 text-sm ${themeClasses.textSecondary}`}
                    >
                      {juego.calificacion}/5
                    </span>
                  </div>

                  {/* Precio */}
                  <div className="mb-3">
                    {juego.descuento ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`${themeClasses.textSecondary} line-through text-sm`}
                        >
                          ${juego.precio.toFixed(2)}
                        </span>
                        <span className="text-green-400 font-bold">
                          {calcularPrecio(juego.precio, juego.descuento)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-green-400 font-bold">
                        {calcularPrecio(juego.precio)}
                      </span>
                    )}
                  </div>

                  {/* Horas jugadas */}
                  {datosJuego.horasJugadas > 0 && (
                    <div
                      className={`flex items-center mb-2 text-sm ${themeClasses.textSecondary}`}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{datosJuego.horasJugadas} horas jugadas</span>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2">
                    <a
                      href={juego.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 ${themeClasses.accent} hover:opacity-80 text-white px-4 py-2 rounded-md transition-colors duration-200`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver en Steam
                    </a>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setModalHoras(juego.id);
                          setNuevasHoras(datosJuego.horasJugadas || 0);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 ${themeClasses.cardBg} ${themeClasses.hover} ${themeClasses.text} px-3 py-2 rounded-md text-sm transition-colors duration-200 border ${themeClasses.borderColor}`}
                      >
                        <Clock className="w-4 h-4" />
                        Horas
                      </button>

                      {juego.tieneForo && (
                        <button
                          onClick={() => {
                            if (datosJuego.miembroForo) {
                              // Si ya es miembro, ir directamente al foro
                              navegarAForoJuego(juego.id, juego.nombre);
                            } else {
                              // Si no es miembro, mostrar modal
                              setModalForo(juego.id);
                            }
                          }}
                          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-colors duration-200 text-white ${
                            datosJuego.miembroForo
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-purple-700 hover:bg-purple-600"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          {datosJuego.miembroForo ? "Ir al Foro" : "Unirse"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensaje si no hay resultados */}
        {juegosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className={`${themeClasses.textSecondary} text-lg`}>
              No se encontraron juegos que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* Modal para actualizar horas */}
      {modalHoras && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${themeClasses.cardBg} p-6 rounded-lg max-w-md w-full mx-4 border ${themeClasses.borderColor}`}
          >
            <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>
              Actualizar Horas Jugadas
            </h3>
            <div className="mb-4">
              <label className={`block ${themeClasses.textSecondary} mb-2`}>
                Horas jugadas:
              </label>
              <input
                type="number"
                min="0"
                value={nuevasHoras}
                onChange={(e) => setNuevasHoras(Number(e.target.value))}
                className={`w-full px-3 py-2 ${themeClasses.inputBg} border ${themeClasses.borderColor} rounded-md ${themeClasses.text} focus:outline-none focus:border-blue-500 transition-colors duration-200`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => actualizarHoras(modalHoras, nuevasHoras)}
                className={`flex-1 ${themeClasses.accent} hover:opacity-80 text-white px-4 py-2 rounded-md transition-colors duration-200`}
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setModalHoras(null);
                  setNuevasHoras(0);
                }}
                className={`flex-1 ${themeClasses.cardBg} ${themeClasses.hover} ${themeClasses.text} px-4 py-2 rounded-md transition-colors duration-200 border ${themeClasses.borderColor}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para unirse al foro */}
      {modalForo &&
        (() => {
          const juegoForo = juegos.find((j) => j.id === modalForo);
          if (!juegoForo) return null;

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                className={`${themeClasses.cardBg} p-6 rounded-lg max-w-md w-full mx-4 border ${themeClasses.borderColor}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>
                  Unirse al Foro de {juegoForo.nombre}
                </h3>
                <p className={`${themeClasses.textSecondary} mb-6`}>
                  ¿Quieres unirte al foro de este juego para participar en
                  discusiones con otros jugadores?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      navegarAForoJuego(juegoForo.id, juegoForo.nombre)
                    }
                    className="flex-1 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    Unirse y Continuar
                  </button>
                  <button
                    onClick={() => setModalForo(null)}
                    className={`flex-1 ${themeClasses.cardBg} ${themeClasses.hover} ${themeClasses.text} px-4 py-2 rounded-md transition-colors duration-200 border ${themeClasses.borderColor}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};
