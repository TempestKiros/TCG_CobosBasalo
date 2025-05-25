// src/pages/Home/Home.tsx - Versión mejorada con mejor centrado y responsividad
import React, { useMemo, useEffect, useState } from "react";
import Slider from "react-slick";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import sharkAnimation from "../../assets/shark-swimming.json";
import { images } from "../../assets/games/gameImages";

// Tipo para las partículas
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const sliderSettings = {
  infinite: true,
  speed: 3000,
  slidesToShow: 1,
  autoplay: true,
  autoplaySpeed: 0,
  cssEase: "linear",
  vertical: true,
  arrows: false,
  pauseOnHover: false,
};

// Componente de partículas flotantes
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Colores de partículas según el tema
  const getParticleColor = () => {
    switch (theme) {
      case "light":
        return "from-blue-400/30 to-purple-400/30";
      case "purple":
        return "from-purple-400/30 to-pink-400/30";
      default:
        return "from-cyan-400/20 to-purple-400/20";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full bg-gradient-to-r ${getParticleColor()}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Fondo animado mejorado con efectos adaptativos al tema
const AnimatedBackground = () => {
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const paths = useMemo(() => {
    const generatePath = (i: number) => {
      const start = Math.random() * 100;
      return `M ${start} 0 
        Q ${Math.random() * 100} ${Math.random() * 100} 
        ${Math.random() * 100} ${Math.random() * 100}
        T ${Math.random() * 100} ${Math.random() * 100}
        T ${Math.random() * 100} ${Math.random() * 100}
        T ${Math.random() * 100} ${Math.random() * 100}`;
    };

    return Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `path-${i}`,
        d: generatePath(i),
        stroke: `hsl(${Math.random() * 360}, 70%, 60%)`,
        strokeWidth: Math.random() * 0.5 + 0.2,
      }));
  }, []);

  // Gradientes de fondo según el tema
  const getBackgroundGradient = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100";
      case "purple":
        return "bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900";
      default:
        return "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900";
    }
  };

  // Colores de efectos de luz según el tema
  const getLightEffects = () => {
    switch (theme) {
      case "light":
        return {
          light1: "bg-blue-400/20",
          light2: "bg-purple-400/20",
        };
      case "purple":
        return {
          light1: "bg-purple-400/20",
          light2: "bg-pink-400/20",
        };
      default:
        return {
          light1: "bg-cyan-500/10",
          light2: "bg-purple-500/10",
        };
    }
  };

  const lightEffects = getLightEffects();

  return (
    <>
      {/* Gradiente base adaptativo */}
      <div className={`fixed inset-0 ${getBackgroundGradient()}`} />

      {/* Efectos de luz ambiental */}
      <motion.div className="fixed inset-0 opacity-30" style={{ y: y1 }}>
        <div
          className={`absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 ${lightEffects.light1} rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 ${lightEffects.light2} rounded-full blur-3xl`}
        />
      </motion.div>

      {/* Líneas animadas */}
      <motion.div className="fixed inset-0 z-0 opacity-25" style={{ y: y2 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="lineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={
                  theme === "light" ? "rgb(59, 130, 246)" : "rgb(34, 211, 238)"
                }
                stopOpacity="0.8"
              />
              <stop
                offset="50%"
                stopColor={
                  theme === "purple" ? "rgb(236, 72, 153)" : "rgb(168, 85, 247)"
                }
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor={
                  theme === "light" ? "rgb(59, 130, 246)" : "rgb(34, 211, 238)"
                }
                stopOpacity="0.8"
              />
            </linearGradient>
          </defs>
          {paths.map((path, index) => (
            <motion.path
              key={path.id}
              d={path.d}
              fill="none"
              stroke={index % 3 === 0 ? "url(#lineGradient)" : path.stroke}
              strokeWidth={path.strokeWidth}
              initial={{ pathLength: 0, pathOffset: 1 }}
              animate={{
                pathOffset: [1, 0],
                pathLength: [0, 1, 0],
              }}
              transition={{
                duration: 15 + Math.random() * 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </svg>
      </motion.div>
    </>
  );
};

// Componente de carousel mejorado
const GameCarousel = ({ side }: { side: "left" | "right" }) => {
  const { theme } = useTheme();

  const getMaskGradient = () => {
    const direction = side === "left" ? "r" : "l";
    switch (theme) {
      case "light":
        return `bg-gradient-to-${direction} from-gray-100 via-transparent to-transparent`;
      case "purple":
        return `bg-gradient-to-${direction} from-purple-900 via-transparent to-transparent`;
      default:
        return `bg-gradient-to-${direction} from-slate-900 via-transparent to-transparent`;
    }
  };

  return (
    <div className="hidden lg:block w-[200px] xl:w-[250px] 2xl:w-[300px] h-screen overflow-hidden relative">
      {/* Efecto de máscara degradada adaptativa */}
      <div className={`absolute inset-0 z-10 ${getMaskGradient()}`} />

      <div className="opacity-30 hover:opacity-50 transition-opacity duration-500">
        <Slider {...sliderSettings}>
          {images.map((src, idx) => (
            <div key={idx} className="relative group">
              <img
                src={src}
                alt={`Juego ${idx + 1}`}
                className="w-full h-screen object-cover saturate-0 group-hover:saturate-100 transition-all duration-700 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Define themeClasses locally since useTheme does not provide it
  const themeClasses = useMemo(() => {
    switch (theme) {
      case "light":
        return {
          text: "text-gray-900",
          textSecondary: "text-gray-600",
          cardBg: "bg-white/80",
          borderColor: "border-gray-300",
          hover: "hover:bg-gray-100",
        };
      case "purple":
        return {
          text: "text-purple-100",
          textSecondary: "text-purple-300",
          cardBg: "bg-purple-900/80",
          borderColor: "border-purple-700",
          hover: "hover:bg-purple-800",
        };
      default:
        return {
          text: "text-slate-100",
          textSecondary: "text-slate-400",
          cardBg: "bg-slate-900/80",
          borderColor: "border-slate-700",
          hover: "hover:bg-slate-800",
        };
    }
  }, [theme]);

  // Colores de botones según el tema
  const getButtonColors = () => {
    switch (theme) {
      case "light":
        return {
          primary:
            "from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600",
          secondary:
            "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600",
          shadow1: "rgba(59, 130, 246, 0.4)",
          shadow2: "rgba(168, 85, 247, 0.4)",
        };
      case "purple":
        return {
          primary:
            "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600",
          secondary:
            "from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600",
          shadow1: "rgba(168, 85, 247, 0.4)",
          shadow2: "rgba(236, 72, 153, 0.4)",
        };
      default:
        return {
          primary:
            "from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500",
          secondary:
            "from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500",
          shadow1: "rgba(6, 182, 212, 0.4)",
          shadow2: "rgba(168, 85, 247, 0.4)",
        };
    }
  };

  const buttonColors = getButtonColors();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingParticles />

      <div className="flex min-h-screen">
        {/* Carousel izquierdo */}
        <GameCarousel side="left" />

        {/* Contenido principal - MEJORADO PARA CENTRADO */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 z-20 relative min-h-screen">
          <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
            {/* Título con efecto mejorado - RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-2 sm:space-y-4"
            >
              <motion.h1
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-none"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  Deep
                </span>
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Time
                </span>
              </motion.h1>

              <motion.p
                className={`${themeClasses.textSecondary} text-base sm:text-lg lg:text-xl xl:text-2xl font-light max-w-3xl mx-auto leading-relaxed px-4`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                Explora un mundo de juegos y reseñas, donde la comunidad se une
                para compartir experiencias y descubrir nuevos títulos. ¡Únete a
                nosotros!
              </motion.p>
            </motion.div>

            {/* Animación Lottie mejorada - RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: -15 }}
              transition={{ duration: 1.2, ease: "backOut", delay: 0.3 }}
              whileHover={{
                scale: 1.05,
                rotate: 0,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="flex justify-center"
            >
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 relative">
                {/* Glow effect adaptativo al tema */}
                <div
                  className={`absolute inset-0 ${
                    theme === "light"
                      ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30"
                      : theme === "purple"
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                      : "bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
                  } rounded-full blur-2xl animate-pulse`}
                />

                <Lottie
                  animationData={sharkAnimation}
                  loop={true}
                  className="relative z-10 drop-shadow-2xl transition-all duration-700"
                />
              </div>
            </motion.div>

            {/* Botones mejorados - RESPONSIVE Y CENTRADOS */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md sm:max-w-lg mx-auto px-4"
            >
              <motion.button
                onClick={() => navigate("/login")}
                className={`group relative px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r ${buttonColors.primary} text-white shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 flex-1`}
                whileTap={{ scale: 0.95 }}
                whileHover={{
                  boxShadow: `0 20px 40px ${buttonColors.shadow1}`,
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🎮 Iniciar Sesión
                </span>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>

              <motion.button
                onClick={() => navigate("/register")}
                className={`group relative px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r ${buttonColors.secondary} text-white shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 flex-1`}
                whileTap={{ scale: 0.95 }}
                whileHover={{
                  boxShadow: `0 20px 40px ${buttonColors.shadow2}`,
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  ✨ Registrarse
                </span>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
            </motion.div>

            {/* Botón de configuración - RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
            >
              <motion.button
                onClick={() => navigate("/ajustes")}
                className={`${themeClasses.cardBg} ${themeClasses.text} px-4 sm:px-6 py-2 sm:py-3 rounded-full border ${themeClasses.borderColor} ${themeClasses.hover} transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm sm:text-base`}
                whileTap={{ scale: 0.95 }}
              >
                ⚙️ Configuración
              </motion.button>

              <div
                className={`text-xs sm:text-sm ${themeClasses.textSecondary} text-center sm:text-left`}
              >
                Tema actual:{" "}
                <span className="text-blue-400 font-semibold">
                  {theme === "light"
                    ? "☀️ Claro"
                    : theme === "dark"
                    ? "🌙 Oscuro"
                    : "💜 Morado"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Indicador de scroll - RESPONSIVE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-5 h-8 sm:w-6 sm:h-10 border-2 ${themeClasses.borderColor} rounded-full p-1`}
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-1 h-2 sm:h-3 ${
                  theme === "light"
                    ? "bg-gradient-to-b from-blue-600 to-purple-600"
                    : theme === "purple"
                    ? "bg-gradient-to-b from-purple-400 to-pink-400"
                    : "bg-gradient-to-b from-cyan-400 to-purple-400"
                } rounded-full mx-auto`}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Carousel derecho */}
        <GameCarousel side="right" />
      </div>

      {/* Glass card flotante con stats adaptativa al tema - RESPONSIVE */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hidden lg:block fixed top-4 right-4 xl:top-6 xl:right-6 z-30"
      >
        <div
          className={`backdrop-blur-lg ${
            theme === "light"
              ? "bg-white/20 border-gray-300/30"
              : "bg-white/10 border-white/20"
          } border rounded-lg xl:rounded-xl p-3 xl:p-4 shadow-2xl`}
        >
          <h3
            className={`${themeClasses.text} font-bold text-sm xl:text-base mb-2 xl:mb-3`}
          >
            Gaming Stats
          </h3>
          <div className="space-y-1.5 xl:space-y-2 text-xs">
            <div
              className={`flex justify-between ${themeClasses.textSecondary}`}
            >
              <span>Usuarios activos:</span>
              <span
                className={`${
                  theme === "light" ? "text-blue-600" : "text-cyan-400"
                } font-bold`}
              >
                12,543
              </span>
            </div>
            <div
              className={`flex justify-between ${themeClasses.textSecondary}`}
            >
              <span>Juegos registrados:</span>
              <span
                className={`${
                  theme === "purple" ? "text-pink-400" : "text-purple-400"
                } font-bold`}
              >
                856,239
              </span>
            </div>
            <div
              className={`flex justify-between ${themeClasses.textSecondary}`}
            >
              <span>Reviews totales:</span>
              <span
                className={`${
                  theme === "light" ? "text-purple-600" : "text-pink-400"
                } font-bold`}
              >
                2,104,567
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
