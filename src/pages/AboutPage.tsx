import { h } from "@tiny/core.ts";
import Icon from "@icons/Icon.tsx";
import { StyleSheet } from "@styles/stylesheet.ts";

export default function AboutPage() {
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
      <ul style={styles.list}>
        <li style={styles.item}>
          <Icon name="email-variant" size={20} aria-hidden="true" />
          <span>
            Email:{" "}
            <a href="mailto:carlosxfelipe@gmail.com" class="link">
              carlosxfelipe@gmail.com
            </a>
          </span>
        </li>

        <li style={styles.item}>
          <Icon name="github" size={20} aria-hidden="true" />
          <span>
            GitHub:{" "}
            <a
              href="https://github.com/carlosxfelipe"
              target="_blank"
              rel="noreferrer"
              class="link"
            >
              github.com/carlosxfelipe
            </a>
          </span>
        </li>

        <li style={styles.item}>
          <Icon name="linkedin" size={20} aria-hidden="true" />
          <span>
            LinkedIn:{" "}
            <a
              href="https://linkedin.com/in/carlosxfelipe"
              target="_blank"
              rel="noreferrer"
              class="link"
            >
              linkedin.com/in/carlosxfelipe
            </a>
          </span>
        </li>

        <li style={styles.item}>
          <Icon name="map-marker-outline" size={20} aria-hidden="true" />
          <span>
            Fortaleza, Ceará, Brasil •{" "}
            <a href="tel:+5585999502195" class="link">
              (85) 99950-2195
            </a>
          </span>
        </li>
      </ul>
    </section>
  );
}

const styles = StyleSheet.create({
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 8,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
});
