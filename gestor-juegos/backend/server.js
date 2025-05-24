// server.js - Servidor principal
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // URLs de tu React app
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "gameManager";

// Validar que las variables de entorno estén configuradas
if (!MONGODB_URI) {
  console.error(
    "❌ Error: MONGODB_URI no está configurado en las variables de entorno"
  );
  console.log(
    "📝 Por favor, crea un archivo .env con tu cadena de conexión de MongoDB Atlas"
  );
  process.exit(1);
}

let db;
let client;

// Conectar a MongoDB
async function connectToDatabase() {
  try {
    console.log("🔄 Intentando conectar a MongoDB Atlas...");

    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 segundos timeout
      connectTimeoutMS: 10000,
    });

    await client.connect();

    // Verificar la conexión
    await client.db("admin").command({ ping: 1 });

    db = client.db(MONGODB_DB);
    console.log("✅ Conectado exitosamente a MongoDB Atlas");
    console.log(`📊 Base de datos: ${MONGODB_DB}`);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB Atlas:");

    if (error.code === 8000) {
      console.error("🔐 Error de autenticación - Verifica:");
      console.error("   - Tu usuario y contraseña en la cadena de conexión");
      console.error("   - Que el usuario tenga permisos en la base de datos");
      console.error("   - Que hayas configurado Database Access correctamente");
    } else if (error.code === 6) {
      console.error("🌐 Error de red - Verifica:");
      console.error("   - Tu conexión a internet");
      console.error("   - Que tu IP esté en la whitelist (Network Access)");
      console.error("   - La URL del cluster sea correcta");
    } else {
      console.error("📝 Error:", error.message);
    }

    console.error("\n💡 Pasos para solucionar:");
    console.error("1. Ve a https://cloud.mongodb.com/");
    console.error("2. Verifica Database Access (usuario y contraseña)");
    console.error("3. Verifica Network Access (whitelist de IPs)");
    console.error("4. Copia la cadena de conexión correcta");
    console.error("5. Actualiza tu archivo .env");

    process.exit(1);
  }
}

// Middleware para verificar conexión DB
const requireDB = (req, res, next) => {
  if (!db) {
    return res.status(500).json({
      error: "Error de conexión a la base de datos",
    });
  }
  req.db = db;
  next();
};

// ====== RUTAS DE HORARIOS ======

// GET /api/horarios - Obtener horarios de un usuario
app.get("/api/horarios", requireDB, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId es requerido",
      });
    }

    const horarios = await req.db
      .collection("horarios")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Convertir ObjectId a string para el frontend
    const horariosFormatted = horarios.map((horario) => ({
      ...horario,
      _id: horario._id.toString(),
    }));

    res.json(horariosFormatted);
  } catch (error) {
    console.error("Error obteniendo horarios:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// POST /api/horarios - Crear nuevo horario
app.post("/api/horarios", requireDB, async (req, res) => {
  try {
    const nuevoHorario = req.body;

    // Validaciones
    if (!nuevoHorario.titulo || !nuevoHorario.userId) {
      return res.status(400).json({
        error: "Faltan campos requeridos: titulo y userId",
      });
    }

    // Agregar timestamps
    nuevoHorario.createdAt = new Date().toISOString();
    nuevoHorario.updatedAt = new Date().toISOString();

    const resultado = await req.db
      .collection("horarios")
      .insertOne(nuevoHorario);

    const horarioCreado = {
      _id: resultado.insertedId.toString(),
      ...nuevoHorario,
    };

    res.status(201).json(horarioCreado);
  } catch (error) {
    console.error("Error creando horario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// PUT /api/horarios/:id - Actualizar horario
app.put("/api/horarios/:id", requireDB, async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    datosActualizacion.updatedAt = new Date().toISOString();

    const resultado = await req.db
      .collection("horarios")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: datosActualizacion },
        { returnDocument: "after" }
      );

    if (!resultado.value) {
      return res.status(404).json({ error: "Horario no encontrado" });
    }

    const horarioActualizado = {
      ...resultado.value,
      _id: resultado.value._id.toString(),
    };

    res.json(horarioActualizado);
  } catch (error) {
    console.error("Error actualizando horario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// DELETE /api/horarios/:id - Eliminar horario
app.delete("/api/horarios/:id", requireDB, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const resultado = await req.db
      .collection("horarios")
      .deleteOne({ _id: new ObjectId(id) });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: "Horario no encontrado" });
    }

    res.json({
      message: "Horario eliminado exitosamente",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error eliminando horario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ====== RUTAS ADICIONALES ======

// GET /api/health - Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: db ? "connected" : "disconnected",
    mongodb_database: MONGODB_DB,
  });
});

// GET /api/stats/:userId - Estadísticas del usuario
app.get("/api/stats/:userId", requireDB, async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await req.db
      .collection("horarios")
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalHorarios: { $sum: 1 },
            totalHoras: { $sum: "$horas" },
            promedioHoras: { $avg: "$horas" },
            horariosCompletados: {
              $sum: { $cond: [{ $eq: ["$completado", true] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();

    const result = stats[0] || {
      totalHorarios: 0,
      totalHoras: 0,
      promedioHoras: 0,
      horariosCompletados: 0,
    };

    res.json(result);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error("Error no manejado:", error);
  res.status(500).json({
    error: "Error interno del servidor",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Iniciar servidor
async function startServer() {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`💾 Base de datos: ${MONGODB_DB}`);
    });
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando servidor...");
  if (client) {
    await client.close();
    console.log("✅ Conexión a MongoDB cerrada");
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Cerrando servidor...");
  if (client) {
    await client.close();
    console.log("✅ Conexión a MongoDB cerrada");
  }
  process.exit(0);
});

startServer();
