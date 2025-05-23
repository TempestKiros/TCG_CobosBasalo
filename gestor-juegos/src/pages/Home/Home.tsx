// src/pages/Home/Home.tsx - Versión actualizada con configuración global
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
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
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

    return Array(15)
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
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${lightEffects.light1} rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${lightEffects.light2} rounded-full blur-3xl`}
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
    <div className="hidden lg:block w-[180px] h-screen overflow-hidden relative">
      {/* Efecto de máscara degradada adaptativa */}
      <div className={`absolute inset-0 z-10 ${getMaskGradient()}`} />

      <div className="opacity-40 hover:opacity-60 transition-opacity duration-500">
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
          textSecondary: "text-gray-500",
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

        {/* Contenido principal */}
        <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-12 z-20 relative">
          {/* Título con efecto mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center space-y-4"
          >
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Gestor
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Gaming
              </span>
            </motion.h1>

            <motion.p
              className={`${themeClasses.textSecondary} text-xl md:text-2xl font-light max-w-2xl leading-relaxed`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Tu biblioteca personal de videojuegos en la nube
            </motion.p>
          </motion.div>

          {/* Animación Lottie mejorada */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: -15 }}
            transition={{ duration: 1.2, ease: "backOut", delay: 0.3 }}
            whileHover={{
              scale: 1.1,
              rotate: 0,
              transition: { type: "spring", stiffness: 300 },
            }}
            className="relative"
          >
            <div className="w-72 h-72 md:w-96 md:h-96 relative">
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

          {/* Botones mejorados con colores adaptativos */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col md:flex-row gap-6 w-full max-w-lg"
          >
            <motion.button
              onClick={() => navigate("/login")}
              className={`group relative px-10 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r ${buttonColors.primary} text-white shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1`}
              whileTap={{ scale: 0.95 }}
              whileHover={{
                boxShadow: `0 20px 40px ${buttonColors.shadow1}`,
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                🎮 Iniciar Sesión
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>

            <motion.button
              onClick={() => navigate("/register")}
              className={`group relative px-10 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r ${buttonColors.secondary} text-white shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1`}
              whileTap={{ scale: 0.95 }}
              whileHover={{
                boxShadow: `0 20px 40px ${buttonColors.shadow2}`,
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ✨ Registrarse
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          </motion.div>

          {/* Botón de acceso a configuración */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="flex items-center gap-4"
          >
            <motion.button
              onClick={() => navigate("/ajustes")}
              className={`${themeClasses.cardBg} ${themeClasses.text} px-6 py-3 rounded-full border ${themeClasses.borderColor} ${themeClasses.hover} transition-all duration-300 hover:scale-105 flex items-center gap-2`}
              whileTap={{ scale: 0.95 }}
            >
              ⚙️ Configuración
            </motion.button>

            <div className={`text-sm ${themeClasses.textSecondary}`}>
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

          {/* Indicador de scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-6 h-10 border-2 ${themeClasses.borderColor} rounded-full p-1`}
            >
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-1 h-3 ${
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

      {/* Glass card flotante con stats adaptativa al tema */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hidden xl:block fixed top-8 right-8 z-30"
      >
        <div
          className={`backdrop-blur-lg ${
            theme === "light"
              ? "bg-white/20 border-gray-300/30"
              : "bg-white/10 border-white/20"
          } border rounded-2xl p-6 shadow-2xl`}
        >
          <h3 className={`${themeClasses.text} font-bold text-lg mb-4`}>
            Gaming Stats
          </h3>
          <div className="space-y-3 text-sm">
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
