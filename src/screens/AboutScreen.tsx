import { h } from "../tiny-preact.ts";
import Icon from "../icons/Icon.tsx";

export default function AboutScreen() {
  return (
    <section>
      <div>
        <h1>Sobre mim</h1>
      </div>

      <p>
        Sou <strong>Carlos Felipe Araújo</strong>, desenvolvedor{" "}
        <em>Mobile e Front-end</em>.
      </p>

      <h2>Contato</h2>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 8,
        }}
      >
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="email-variant" size={20} aria-hidden="true" />
          <span>
            Email:{" "}
            <a href="mailto:carlosxfelipe@gmail.com">carlosxfelipe@gmail.com</a>
          </span>
        </li>

        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="github" size={20} aria-hidden="true" />
          <span>
            GitHub:{" "}
            <a
              href="https://github.com/carlosxfelipe"
              target="_blank"
              rel="noreferrer"
            >
              github.com/carlosxfelipe
            </a>
          </span>
        </li>

        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="linkedin" size={20} aria-hidden="true" />
          <span>
            LinkedIn:{" "}
            <a
              href="https://linkedin.com/in/carlosxfelipe"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.com/in/carlosxfelipe
            </a>
          </span>
        </li>

        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="map-marker-outline" size={20} aria-hidden="true" />
          <span>
            Fortaleza, Ceará, Brasil •{" "}
            <a href="tel:+5585999502195">(85) 99950-2195</a>
          </span>
        </li>
      </ul>
    </section>
  );
}
