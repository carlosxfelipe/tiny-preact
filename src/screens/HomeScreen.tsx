import { h } from "../tiny-preact.ts";

export default function HomeScreen() {
  return (
    <section>
      <h1>Bem-vindo ao Tiny-preact</h1>
      <p>
        O <strong>Tiny-preact</strong> é uma mini-lib inspirada em React/Preact,
        criada para demonstrações e sites estáticos simples. Ele oferece um
        núcleo enxuto com suporte a <code>h</code>, <code>mount</code>,{" "}
        <code>useState</code> e <code>useEffect</code>.
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
    </section>
  );
}
