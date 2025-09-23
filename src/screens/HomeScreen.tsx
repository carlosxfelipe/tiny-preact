import { h, useRef } from "@tiny/tiny-vdom.ts";
import { StyleSheet } from "@styles/stylesheet.ts";

export default function HomeScreen() {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  function highlightTitle() {
    if (headingRef.current) {
      headingRef.current.style.color = "tomato";
    }
  }

  return (
    <section>
      <h1 ref={headingRef}>Bem-vindo ao Tiny-vdom</h1>
      <p>
        O{" "}
        <a
          href="https://github.com/carlosxfelipe/tiny-vdom"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
        >
          <strong>Tiny-vdom</strong>
        </a>{" "}
        é uma mini-lib inspirada em React/Preact, criada para demonstrações e
        sites estáticos simples. Ele oferece um núcleo enxuto com suporte a{" "}
        <code>h</code>, <code>mount</code>, <code>useState</code>,{" "}
        <code>useEffect</code>,{" "}
        <code style={{ cursor: "pointer" }} onClick={highlightTitle}>
          useRef
        </code>
        , <code>useMemo</code> e <code>useCallback</code>.
      </p>
      <p>
        A proposta é permitir a criação de componentes reativos com JSX
        clássico, mas sem dependências externas — perfeito para estudos ou
        protótipos rápidos.
      </p>
      <p>
        O projeto é bundlado com <strong>Deno 2.5+</strong>, o que possibilita
        gerar arquivos prontos para produção em <code>dist/</code> e servir de
        forma estática em qualquer CDN ou edge server.
      </p>

      <div style={styles.featuresCard}>
        <p style={styles.featuresIntro}>
          Além do núcleo, o Tiny-vdom traz dois recursos extras que facilitam o
          desenvolvimento:
        </p>
        <ul style={styles.featuresList}>
          <li style={styles.featureItem}>
            <span aria-hidden="true" style={styles.emoji}>
              🧠
            </span>
            <div style={styles.featureText}>
              <strong>Gerenciamento de estado</strong>: inspirado em zustand,
              com <code>createStore</code>, <em>set</em>/<em>get</em>,
              selectors, persistência opcional em <code>localStorage</code>,
              suporte a assinaturas e sincronização entre abas.
            </div>
          </li>
          <li style={styles.featureItem}>
            <span aria-hidden="true" style={styles.emoji}>
              🎨
            </span>
            <div style={styles.featureText}>
              <strong>StyleSheet utilitário</strong>: inspirado no React Native,
              permitindo declarar estilos em objetos TypeScript, fazer
              merge/compose de estilos e usar variáveis CSS de forma prática.
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

const styles = StyleSheet.create({
  featuresCard: {
    border: "1px solid var(--card-border)",
    background: "var(--card-bg)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "var(--shadow)",
    margin: "16px 0 12px",
  },
  featuresIntro: {
    marginTop: 0,
    marginBottom: 10,
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 10,
  },
  featureItem: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    alignItems: "start",
    gap: 10,
    padding: 10,
    border: "1px solid var(--btn-border)",
    borderRadius: 12,
    background: "var(--btn-bg)",
  },
  emoji: {
    fontSize: 18,
    lineHeight: 1,
    marginTop: 2,
  },
  featureText: {},
});
