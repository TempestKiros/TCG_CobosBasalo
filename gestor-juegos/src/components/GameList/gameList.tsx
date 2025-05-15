import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./gameList.module.css";

interface Game {
  _id: string;
  name: string;
}

export const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [newGame, setNewGame] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchGames = async () => {
    const res = await axios.get("http://localhost:4000/api/games");
    setGames(res.data);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!newGame.trim()) return;

    if (editId) {
      await axios.put(`http://localhost:4000/api/games/${editId}`, {
        name: newGame,
      });
      setEditId(null);
    } else {
      await axios.post("http://localhost:4000/api/games", { name: newGame });
    }

    setNewGame("");
    fetchGames();
  };

  const handleEdit = (game: Game) => {
    setNewGame(game.name);
    setEditId(game._id);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:4000/api/games/${id}`);
    fetchGames();
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestor de Juegos</h2>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Buscar juego..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Nombre del juego"
          value={newGame}
          onChange={(e) => setNewGame(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleAddOrUpdate} className={styles.button}>
          {editId ? "Actualizar" : "Agregar"}
        </button>
      </div>

      <ul className={styles.list}>
        {filteredGames.map((game) => (
          <li key={game._id} className={styles.item}>
            🎮 {game.name}
            <div style={{ float: "right" }}>
              <button onClick={() => handleEdit(game)} className={styles.edit}>
                ✏️
              </button>
              <button
                onClick={() => handleDelete(game._id)}
                className={styles.delete}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
