import { h, useState } from "@tiny/tiny-preact.ts";
import { StyleSheet } from "@styles/stylesheet.ts";

type Variant = "default" | "primary" | "danger";

interface ButtonProps {
  children?: unknown;
  variant?: Variant;
  ariaLabel?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "default",
  ariaLabel,
  onClick,
  type = "button",
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [focus, setFocus] = useState(false);

  const base = styles.button;

  const byVariant =
    variant === "primary"
      ? styles.buttonPrimary
      : variant === "danger"
      ? styles.buttonDanger
      : {};

  const byHover =
    variant === "primary"
      ? styles.buttonPrimaryHover
      : variant === "danger"
      ? styles.buttonDangerHover
      : styles.buttonHover;

  const byActive =
    variant === "primary"
      ? styles.buttonPrimaryActive
      : variant === "danger"
      ? styles.buttonDangerActive
      : styles.buttonActive;

  const style = {
    ...base,
    ...byVariant,
    ...(hover ? byHover : {}),
    ...(active ? byActive : {}),
    ...(focus ? styles.buttonFocus : {}),
  };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      {children}
    </button>
  );
}

const styles = StyleSheet.create({
  button: {
    appearance: "none",
    border: "1px solid var(--btn-border)",
    background: "var(--btn-bg)",
    color: "var(--fg)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition:
      "transform 0.06s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
    outline: "none",
  },
  buttonHover: { background: "var(--btn-hover)" },
  buttonActive: {
    transform: "translateY(1px)",
    background: "var(--btn-active)",
  },
  buttonPrimary: {
    background: "var(--primary)",
    borderColor: "var(--primary)",
    color: "#fff",
  },
  buttonPrimaryHover: {
    background: "var(--primary-hover)",
    borderColor: "var(--primary-hover)",
  },
  buttonPrimaryActive: {
    transform: "translateY(1px)",
    background: "var(--primary-hover)",
    borderColor: "var(--primary-hover)",
  },
  buttonDanger: {
    background: "var(--danger)",
    borderColor: "var(--danger)",
    color: "#fff",
  },
  buttonDangerHover: {
    background: "var(--danger-hover)",
    borderColor: "var(--danger-hover)",
  },
  buttonDangerActive: {
    transform: "translateY(1px)",
    background: "var(--danger-hover)",
    borderColor: "var(--danger-hover)",
  },
  buttonFocus: { boxShadow: "var(--ring)" },
});
