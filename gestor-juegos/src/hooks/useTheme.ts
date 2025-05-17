// src/hooks/useTheme.ts
import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
};
