// src/pages/Home/Home.tsx
import React from "react";
import Slider from "react-slick";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import sharkAnimation from "../../assets/shark-swimming.json";
import styles from "./Home.module.css";

// src/pages/Home/Home.tsx
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
};

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.carousel}>
        <Slider {...sliderSettings}>
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Juego ${idx}`}
              style={{ width: "100%" }}
            />
          ))}
        </Slider>
      </div>

      <div className={styles.center}>
        <h1 className={styles.title}>Gestor de Videojuegos</h1>
        <div className={styles.shark}>
          <Lottie animationData={sharkAnimation} loop={true} />
        </div>
        <div className={styles.buttons}>
          <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
          <button onClick={() => navigate("/register")}>Registrarse</button>
        </div>
      </div>

      <div className={styles.carousel}>
        <Slider {...sliderSettings}>
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Juego ${idx}`}
              style={{ width: "100%" }}
            />
          ))}
        </Slider>
      </div>
    </div>
  );
};
