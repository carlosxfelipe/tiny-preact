import { h, useState, useEffect } from "../tiny-preact.ts";
import { hello } from "../utils.ts";

export default function CounterScreen() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "+" || k === "=") setN((v: number) => v + 1);
      else if (k === "-" || k === "_") setN((v: number) => v - 1);
      else if (k === "0" || k.toLowerCase() === "r") setN(0);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div class="card" style={{ textAlign: "center" }}>
      <h2 class="title">Contador</h2>
      <div
        class="value"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        title={`Valor atual: ${n}`}
      >
        {n}
      </div>

      <div class="controls">
        <button
          type="button"
          class="button"
          aria-label="Subtrair 1"
          onClick={() => setN(n - 1)}
        >
          −1
        </button>
        <button
          type="button"
          class="button primary"
          aria-label="Adicionar 1"
          onClick={() => setN(n + 1)}
        >
          +1
        </button>
        <button
          type="button"
          class="button danger"
          aria-label="Resetar"
          onClick={() => setN(0)}
        >
          reset
        </button>
      </div>

      <p class="kbd-hint">atalhos: [+], [−], [0] ou [R]</p>
      {/* <p class="hint">{hello("Mundo")}</p> */}
    </div>
  );
}
