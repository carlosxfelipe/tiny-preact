import { h } from "@tiny/tiny-vdom.ts";
import { StyleSheet } from "@styles/stylesheet.ts";
import Button from "@components/Button.tsx";

export default function LoginScreen() {
  return (
    <section style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Entrar</h1>
        <form onSubmit={(e: Event) => e.preventDefault()}>
          <div style={styles.field}>
            <label for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label for="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={styles.input}
            />
          </div>
          <Button type="submit" variant="primary">
            Entrar
          </Button>
        </form>
      </div>
    </section>
  );
}

const styles = StyleSheet.create({
  wrap: { display: "grid", placeItems: "center", minHeight: "70dvh" },
  card: {
    width: "min(420px, 92vw)",
    padding: 24,
    border: "1px solid var(--card-border)",
    borderRadius: 16,
    background: "var(--card-bg)",
    boxShadow: "var(--shadow)",
  },
  title: { marginTop: 0, marginBottom: 16 },
  field: { display: "grid", gap: 6, marginBottom: 12 },
  input: {
    padding: "10px 12px",
    border: "1px solid var(--card-border)",
    background: "var(--bg)",
    color: "var(--fg)",
    borderRadius: 10,
    outline: "none",
  },
});
