// src/components/GameList/GameList.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./GameList.module.css";

interface Game {
  _id: string;
  title: string;
  genre: string;
  platform: string;
}

export const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      const res = await axios.get<Game[]>("http://localhost:4000/api/games");
      setGames(res.data);
    };
    fetchGames();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lista de Juegos</h2>
      <ul className={styles.list}>
        {games.map((game) => (
          <li key={game._id} className={styles.item}>
            <strong>{game.title}</strong> — {game.genre} — {game.platform}
          </li>
        ))}
      </ul>
    </div>
  );
};
