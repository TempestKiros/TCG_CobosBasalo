import express from "express";
import Game from "./models/game";
const router = express.Router();

router.get("/", async (req, res) => {
  const games = await Game.find();
  res.json(games);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  const game = new Game({ name });
  await game.save();
  res.json(game);
});

router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const game = await Game.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
  res.json(game);
});

router.delete("/:id", async (req, res) => {
  await Game.findByIdAndDelete(req.params.id);
  res.json({ message: "Juego eliminado" });
});

export default router;
