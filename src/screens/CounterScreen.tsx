import { h, useState, useEffect } from "../../lib/tiny-preact.ts";
import Icon from "../icons/Icon.tsx";
import { StyleSheet } from "../styles/stylesheet.ts";
// import { hello } from "../utils/hello.ts";

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
    <div style={styles.card}>
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

      <div style={styles.controls}>
        <button
          type="button"
          class="button"
          aria-label="Subtrair 1"
          onClick={() => setN(n - 1)}
        >
          <Icon name="minus" size={20} ariaLabel="menos" />
        </button>
        <button
          type="button"
          class="button primary"
          aria-label="Adicionar 1"
          onClick={() => setN(n + 1)}
        >
          <Icon name="plus" size={20} ariaLabel="mais" />
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

      <p style={styles.kbdHint}>atalhos: [+], [−], [0] ou [R]</p>
      {/* <p>{hello("Mundo")}</p> */}
    </div>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "min(520px, 92vw)",
    padding: 28,
    border: "1px solid var(--card-border)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
    background: "var(--card-bg)",
    margin: "0 auto",
    textAlign: "center",
  },
  controls: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 12,
  },
  kbdHint: {
    marginTop: 4,
    fontSize: 12,
    color: "var(--muted)",
    opacity: 0.9,
  },
});
