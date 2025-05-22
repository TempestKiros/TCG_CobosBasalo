const { Schema, model } = require("mongoose");

const horarioSchema = new Schema({
  uid: { type: String, required: true },
  fecha: { type: Date, required: true },
  horas: { type: Number, required: true },
  detalles: { type: Object },
});

module.exports = model("Horario", horarioSchema);
