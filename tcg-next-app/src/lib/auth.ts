// lib/auth.ts

export const USERS = [{ username: "Pepe", password: "1234" }];

export function validateUser(username: string, password: string) {
  return USERS.find((u) => u.username === username && u.password === password);
}
