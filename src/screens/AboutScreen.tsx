import { h } from "../tiny-preact.ts";

export default function AboutScreen() {
  return (
    <section>
      <h1>Sobre mim</h1>
      <p>
        Sou <strong>Carlos Felipe Araújo</strong>, desenvolvedor{" "}
        <em>Mobile e Front-end</em>.
      </p>

      <h2>Resumo</h2>
      <p>
        Fui professor de espanhol por vários anos e, nos últimos 3 anos, migrei
        para desenvolvimento de software. Hoje foco em apps móveis e front-end,
        com interesse por libs enxutas e deploy estático.
      </p>

      <h2>Contato</h2>
      <ul>
        <li>
          Email:{" "}
          <a href="mailto:carlosxfelipe@gmail.com">carlosxfelipe@gmail.com</a>
        </li>
        <li>
          GitHub:{" "}
          <a
            href="https://github.com/carlosxfelipe"
            target="_blank"
            rel="noreferrer"
          >
            github.com/carlosxfelipe
          </a>
        </li>
        <li>
          LinkedIn:{" "}
          <a
            href="https://linkedin.com/in/carlosxfelipe"
            target="_blank"
            rel="noreferrer"
          >
            linkedin.com/in/carlosxfelipe
          </a>
        </li>
        <li>
          Fortaleza, Ceará, Brasil •{" "}
          <a href="tel:+5585999502195">(85) 99950-2195</a>
        </li>
      </ul>
    </section>
  );
}
