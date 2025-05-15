import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import gamesRouter from "./routes/games";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Monta las rutas de “games” bajo el path “/games”
app.use("/games", gamesRouter);

// Ruta de prueba
app.get("/", (_req, res) => {
  res.send("API funcionando");
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("🔗 MongoDB conectado"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
