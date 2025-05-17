import { setTheme } from "../../../utils/themeSwitcher";

export default function Ajustes() {
  return (
    <div>
      <h2>Ajustes</h2>
      <button onClick={() => setTheme("light")}>Claro</button>
      <button onClick={() => setTheme("dark")}>Oscuro</button>
      <button onClick={() => setTheme("purple")}>Morado oscuro</button>
    </div>
  );
}
