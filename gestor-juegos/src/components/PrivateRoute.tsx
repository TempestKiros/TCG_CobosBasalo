import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

interface Props {
  children: JSX.Element;
}

export function PrivateRoute({ children }: Props) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Cargando...</p>;

  return user ? children : <Navigate to="/login" />;
}
