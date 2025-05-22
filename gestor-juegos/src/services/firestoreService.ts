// src/services/firestoreService.ts

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Define la interfaz de tu documento de usuario (ajústala a tu esquema real)
 */
export interface UserProfile {
  id?: string;
  username: string;
  identifier: string;
  description?: string;
  email: string;
  joinedAt: Timestamp;
  lastLogin: Timestamp;
  streak: number;
  followers: number;
  following: number;
  groupsLocked: boolean;
}

/**
 * Referencia a la colección "users"
 */
const usersCollection = collection(db, "users");

/**
 * Lista todos los usuarios
 */
export async function listarUsuarios(): Promise<UserProfile[]> {
  const snap: QuerySnapshot<DocumentData> = await getDocs(usersCollection);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<UserProfile, "id">),
  }));
}

/**
 * Obtiene un usuario por ID
 */
export async function obtenerUsuario(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap: DocumentSnapshot<DocumentData> = await getDoc(ref);
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...(snap.data() as Omit<UserProfile, "id">),
  };
}

/**
 * Crea un nuevo usuario
 */
export async function crearUsuario(
  data: Omit<UserProfile, "id">
): Promise<string> {
  const docRef = await addDoc(usersCollection, data);
  return docRef.id;
}

/**
 * Actualiza un usuario existente
 */
export async function actualizarUsuario(
  uid: string,
  data: Partial<Omit<UserProfile, "id">>
): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, data);
}

/**
 * Elimina un usuario
 */
export async function eliminarUsuario(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
}
