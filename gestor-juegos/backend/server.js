require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const Horario = require("./models/Horario");

// Crear horario
app.post("/api/horarios", async (req, res) => {
  const nuevo = new Horario(req.body);
  await nuevo.save();
  res.json({ success: true });
});

// Obtener horarios de un usuario
app.get("/api/horarios/:uid", async (req, res) => {
  const horarios = await Horario.find({ uid: req.params.uid });
  res.json(horarios);
});

app.listen(4000, () => console.log("Backend escuchando en 4000"));
