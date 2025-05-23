const mongoose = require("mongoose");

const juegoSchema = new mongoose.Schema({
  nombre: String,
  plataforma: String,
  fecha: Date,
});

module.exports = mongoose.model("Juego", juegoSchema);
