// src/pages/Home/Home.tsx
import React, { useMemo, useEffect, useState } from "react";
import Slider from "react-slick";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import sharkAnimation from "../../assets/shark-swimming.json";
import { images } from "../../assets/games/gameImages";

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

// Tipo para las partículas
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

// Componente de partículas flotantes
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

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

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20"
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

// Fondo animado mejorado con efectos de glassmorphism
const AnimatedBackground = () => {
  const { scrollY } = useScroll();
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

  return (
    <>
      {/* Gradiente base mejorado */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />

      {/* Efectos de luz ambiental */}
      <motion.div className="fixed inset-0 opacity-30" style={{ y: y1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
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
                stopColor="rgb(34, 211, 238)"
                stopOpacity="0.8"
              />
              <stop
                offset="50%"
                stopColor="rgb(168, 85, 247)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="rgb(34, 211, 238)"
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
const GameCarousel = ({ side }: { side: "left" | "right" }) => (
  <div className="hidden lg:block w-[180px] h-screen overflow-hidden relative">
    {/* Efecto de máscara degradada */}
    <div
      className={`absolute inset-0 z-10 bg-gradient-to-${
        side === "left" ? "r" : "l"
      } from-slate-900 via-transparent to-transparent`}
    />

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

export const Home: React.FC = () => {
  const navigate = useNavigate();

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
              className="text-slate-300 text-xl md:text-2xl font-light max-w-2xl leading-relaxed"
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
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />

              <Lottie
                animationData={sharkAnimation}
                loop={true}
                className="relative z-10 drop-shadow-2xl transition-all duration-700"
              />
            </div>
          </motion.div>

          {/* Botones mejorados */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col md:flex-row gap-6 w-full max-w-lg"
          >
            <motion.button
              onClick={() => navigate("/login")}
              className="group relative px-10 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
              whileTap={{ scale: 0.95 }}
              whileHover={{
                boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                🎮 Iniciar Sesión
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>

            <motion.button
              onClick={() => navigate("/register")}
              className="group relative px-10 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
              whileTap={{ scale: 0.95 }}
              whileHover={{
                boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ✨ Registrarse
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
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
              className="w-6 h-10 border-2 border-slate-400 rounded-full p-1"
            >
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full mx-auto"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Carousel derecho */}
        <GameCarousel side="right" />
      </div>

      {/* Glass card flotante con stats */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hidden xl:block fixed top-8 right-8 z-30"
      >
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-white font-bold text-lg mb-4">Gaming Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Usuarios activos: </span>
              <span className="text-cyan-400 font-bold">12,543</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Juegos registrados: </span>
              <span className="text-purple-400 font-bold">856,239</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Reviews totales: </span>
              <span className="text-pink-400 font-bold">2,104,567</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
