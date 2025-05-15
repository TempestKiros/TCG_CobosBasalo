import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import gamesRoutes from "./games.routes";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/gamesDB")
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error conectando a MongoDB", err));

app.use("/api/games", gamesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});
