// utils/themeSwitcher.ts
export const setTheme = (theme: "light" | "dark" | "purple") => {
  document.body.classList.remove("dark-mode", "purple-mode");
  if (theme === "dark") document.body.classList.add("dark-mode");
  else if (theme === "purple") document.body.classList.add("purple-mode");
};
