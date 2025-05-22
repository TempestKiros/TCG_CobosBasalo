// src/pages/Home/Home.tsx
import React, { useMemo } from "react";
import Slider from "react-slick";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const AnimatedBackground = () => {
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

    return Array(12)
      .fill(null)
      .map((_, i) => ({
        id: `path-${i}`,
        d: generatePath(i),
        stroke: `hsl(${Math.random() * 360}, 70%, 60%)`,
      }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 opacity-20">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            fill="none"
            stroke={path.stroke}
            strokeWidth="0.3"
            initial={{ pathLength: 0, pathOffset: 1 }}
            animate={{
              pathOffset: [1, 0],
              transition: {
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col md:flex-row items-center justify-center overflow-hidden relative">
      <AnimatedBackground />

      {/* Carousels laterales */}
      <div className="hidden md:block w-[150px] h-screen overflow-hidden opacity-30">
        <Slider {...sliderSettings}>
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Juego ${idx + 1}`}
              className="w-full h-screen object-cover saturate-0"
            />
          ))}
        </Slider>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-8 z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Gestor de Videojuegos
        </h1>

        <div className="w-64 h-64 md:w-80 md:h-80 hover:scale-105 transition-transform duration-300">
          <Lottie
            animationData={sharkAnimation}
            loop={true}
            className="rotate-[-15deg] hover:rotate-0 transition-transform duration-500"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
          <button
            onClick={() => navigate("/login")}
            className="rainbow-button relative overflow-hidden group px-8 py-4 text-lg font-bold rounded-lg transition-all duration-500"
          >
            <span className="relative z-10">Iniciar Sesión</span>
          </button>

          <button
            onClick={() => navigate("/register")}
            className="rainbow-button relative overflow-hidden group px-8 py-4 text-lg font-bold rounded-lg transition-all duration-500"
            style={
              {
                "--clr1": "#ff6b6b",
                "--clr2": "#4ecdc4",
              } as React.CSSProperties
            }
          >
            <span className="relative z-10">Registrarse</span>
          </button>
        </div>
      </div>

      {/* Carousel derecho */}
      <div className="hidden md:block w-[150px] h-screen overflow-hidden opacity-30">
        <Slider {...sliderSettings}>
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Juego ${idx + 1}`}
              className="w-full h-screen object-cover saturate-0"
            />
          ))}
        </Slider>
      </div>

      {/* Estilos para los botones rainbow */}
      <style>{`
        .rainbow-button {
          background: linear-gradient(
            90deg,
            var(--clr1, #ff6b6b),
            var(--clr2, #4ecdc4),
            var(--clr3, #45b7d1),
            var(--clr4, #96f2d7)
          );
          background-size: 300% 300%;
          background-position: 0% 50%;
          border: 2px solid transparent;
          border-image: linear-gradient(
              45deg,
              var(--clr1, #ff6b6b),
              var(--clr2, #4ecdc4)
            )
            1;
        }

        .rainbow-button::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 25%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 75%
          );
          transform: rotate(45deg);
          transition: all 0.5s;
          opacity: 0;
        }

        .rainbow-button:hover {
          background-position: 100% 50%;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .rainbow-button:hover::before {
          opacity: 1;
          left: 150%;
        }
      `}</style>
    </div>
  );
};
