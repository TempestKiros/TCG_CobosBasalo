import { FC } from "react";
import styles from "./HomePage.module.css";

interface Game {
  title: string;
  hours: number;
}

interface HomePageProps {
  recentGames?: Game[];
  favorites?: string[];
}

const HomePage: FC<HomePageProps> = ({
  recentGames = [
    { title: "The Witcher 3", hours: 50 },
    { title: "God of War", hours: 20 },
    { title: "Cyberpunk 2077", hours: 30 },
  ],
  favorites = ["Red Dead Redemption 2", "Hollow Knight", "Persona 5"],
}) => (
  <div className={styles.container}>
    <h1 className={styles.title}>🎮 Mi Gestor de Videojuegos</h1>

    <section className={styles.section}>
      <h2>🎯 Juegos Recientes</h2>
      <div className={styles.grid}>
        {recentGames.map((game, i) => (
          <div key={i} className={styles.card}>
            <h3>{game.title}</h3>
            <p>Horas jugadas: {game.hours}</p>
          </div>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <h2>⭐ Favoritos</h2>
      <ul className={styles.favList}>
        {favorites.map((fav, i) => (
          <li key={i}>{fav}</li>
        ))}
      </ul>
    </section>

    <section className={styles.section}>
      <h2>🔍 Buscar Juegos</h2>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Escribe el nombre de un juego..."
      />
    </section>
  </div>
);

export default HomePage;
