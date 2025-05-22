const API = "http://localhost:4000/api/horarios";

export const guardarHorario = (data: any) =>
  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const obtenerHorarios = (uid: string) =>
  fetch(`${API}/${uid}`).then((res) => res.json());
