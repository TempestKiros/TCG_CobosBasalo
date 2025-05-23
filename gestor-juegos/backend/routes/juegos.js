const express = require("express");
const router = express.Router();
const Juego = require("../models/Juego");

// GET todos los juegos
router.get("/", async (req, res) => {
  const juegos = await Juego.find();
  res.json(juegos);
});

// POST crear un nuevo juego
router.post("/", async (req, res) => {
  const nuevoJuego = new Juego(req.body);
  await nuevoJuego.save();
  res.status(201).json(nuevoJuego);
});

module.exports = router;
