import { Schema, model } from "mongoose";

const GameSchema = new Schema({
  title: { type: String, required: true },
  genre: String,
  platform: String,
  rating: Number,
});

export const Game = model("Game", GameSchema);
