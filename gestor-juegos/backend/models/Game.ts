import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export default mongoose.model("Game", GameSchema);
