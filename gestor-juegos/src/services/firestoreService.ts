// src/services/realtimeDatabaseService.ts

import {
  ref,
  get,
  set,
  update,
  remove,
  DatabaseReference,
} from "firebase/database";
import { database } from "../firebase/config";

export interface UserProfile {
  username: string;
  identifier: string;
  description?: string;
  email: string;
  joinedAt: number; // timestamp unix en ms
  lastLogin: number; // timestamp unix en ms
  streak: number;
  followers: number;
  following: number;
  groupsLocked: boolean;
}

/**
 * Referencia a la ruta "users"
 */
const usersRef = ref(database, "users");

/**
 * Lista todos los usuarios
 */
export async function listarUsuarios(): Promise<{
  [uid: string]: UserProfile;
}> {
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return {};
  return snapshot.val(); // Devuelve un objeto con uid como clave y UserProfile como valor
}

/**
 * Obtiene un usuario por uid
 */
export async function obtenerUsuario(uid: string): Promise<UserProfile | null> {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) return null;
  return snapshot.val() as UserProfile;
}

/**
 * Crea o sobreescribe un usuario
 */
export async function crearUsuario(
  uid: string,
  data: UserProfile
): Promise<void> {
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, data);
}

/**
 * Actualiza un usuario parcialmente (solo las claves que pases)
 */
export async function actualizarUsuario(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userRef = ref(database, `users/${uid}`);
  await update(userRef, data);
}

/**
 * Elimina un usuario
 */
export async function eliminarUsuario(uid: string): Promise<void> {
  const userRef = ref(database, `users/${uid}`);
  await remove(userRef);
}
