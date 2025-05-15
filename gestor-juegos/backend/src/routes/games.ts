import { Router } from "express";
import { Game } from "../models/Game";

const router = Router();

// Obtener todos los juegos
router.get("/", async (_req, res) => {
  const games = await Game.find();
  res.json(games);
});

// Crear un nuevo juego
router.post("/", async (req, res) => {
  const newGame = new Game(req.body);
  await newGame.save();
  res.status(201).json(newGame);
});

// (Aquí podrías añadir PUT y DELETE…)

export default router;
