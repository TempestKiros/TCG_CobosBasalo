import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3005", // URL de tu backend Express
});
