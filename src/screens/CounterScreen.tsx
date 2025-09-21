import { h, useEffect } from "@tiny/tiny-preact.ts";
import Icon from "@icons/Icon.tsx";
import Button from "@components/Button.tsx";
import { StyleSheet } from "@styles/stylesheet.ts";
import { useCounter } from "@src/store/counter.ts";
// import { hello } from "@utils/hello.ts";

export default function CounterScreen() {
  const n = useCounter((s) => s.count);
  const inc = useCounter((s) => s.inc);
  const dec = useCounter((s) => s.dec);
  const reset = useCounter((s) => s.reset);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "+" || k === "=") inc();
      else if (k === "-" || k === "_") dec();
      else if (k === "0" || k.toLowerCase() === "r") reset();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Contador</h2>
      <div style={styles.value} role="status">
        {n}
      </div>
      <div style={styles.controls}>
        <Button ariaLabel="Subtrair 1" onClick={dec}>
          <Icon name="minus" size={20} ariaLabel="menos" />
        </Button>
        <Button ariaLabel="Adicionar 1" variant="primary" onClick={inc}>
          <Icon name="plus" size={20} ariaLabel="mais" />
        </Button>
        <Button ariaLabel="Resetar" variant="danger" onClick={reset}>
          reset
        </Button>
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
    margin: "24px auto 0",
    textAlign: "center",
  },
  title: {
    margin: "0 0 8px",
    fontSize: 18,
    color: "var(--muted)",
    fontWeight: 600,
    letterSpacing: "0.2px",
  },
  value: {
    fontSize: "clamp(48px, 9vw, 80px)",
    fontWeight: 800,
    lineHeight: 1,
    margin: "8px 0 18px",
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
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
