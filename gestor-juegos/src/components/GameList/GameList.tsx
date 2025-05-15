import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import styles from "./GameList.module.css";
import { useAuth } from "../../hooks/useAuth";

interface Game {
  _id: string;
  title: string;
  genre: string;
  platform: string;
}

export const GameList: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      fetchGames();
    }
  }, [user]);

  const fetchGames = async () => {
    try {
      const res = await axios.get<Game[]>("http://localhost:4000/api/games");
      setGames(res.data);
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  };

  const handleSave = async () => {
    if (!newTitle.trim() || !newGenre.trim() || !newPlatform.trim()) return;
    const payload = { title: newTitle, genre: newGenre, platform: newPlatform };

    try {
      if (editId) {
        await axios.put(`http://localhost:4000/api/games/${editId}`, payload);
        setEditId(null);
      } else {
        await axios.post("http://localhost:4000/api/games", payload);
      }
      setNewTitle("");
      setNewGenre("");
      setNewPlatform("");
      await fetchGames();
    } catch (err) {
      console.error("Error saving game:", err);
    }
  };

  const handleEdit = (game: Game) => {
    setEditId(game._id);
    setNewTitle(game.title);
    setNewGenre(game.genre);
    setNewPlatform(game.platform);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este juego?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/games/${id}`);
      await fetchGames();
    } catch (err) {
      console.error("Error deleting game:", err);
    }
  };

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestor de Juegos</h2>

      {isLoading && <p>Cargando usuario...</p>}

      <div className={styles.controls}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <div className={styles.form}>
        <input
          type="text"
          placeholder="Título"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Género"
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Plataforma"
          value={newPlatform}
          onChange={(e) => setNewPlatform(e.target.value)}
        />
        <button onClick={handleSave}>
          {editId ? "Guardar cambios" : "Agregar juego"}
        </button>
      </div>

      <ul className={styles.gameList}>
        {filteredGames.map((game) => (
          <li key={game._id} className={styles.gameItem}>
            <strong>{game.title}</strong> - {game.genre} ({game.platform})
            <div className={styles.actions}>
              <button onClick={() => handleEdit(game)}>Editar</button>
              <button onClick={() => handleDelete(game._id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
