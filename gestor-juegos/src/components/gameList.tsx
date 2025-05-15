import React from "react";
import { useGames } from "../hooks/useGame";

export function GameList() {
  const { games, isLoading, isError } = useGames();

  if (isLoading) return <p>Cargando juegos...</p>;
  if (isError) return <p>Error al cargar los juegos.</p>;

  return (
    <ul>
      {games.map((game: any) => (
        <li key={game._id}>
          <strong>{game.title}</strong> — {game.genre} — {game.platform}
        </li>
      ))}
    </ul>
  );
}
