import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import gamesRoutes from "./routes/games";

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración básica
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error en MongoDB:", err));

// Rutas
app.use("/api/games", gamesRoutes);

// Manejo de errores global
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Algo salió mal!" });
  }
);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});

// Manejo de cierre
process.on("SIGINT", () => {
  server.close(() => {
    mongoose.connection.close();
    console.log("🔴 Servidor apagado");
    process.exit(0);
  });
});
