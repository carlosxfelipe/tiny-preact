import { h, useReducer, forwardRef } from "@tiny/index.ts";
import { StyleSheet } from "@styles/stylesheet.ts";

type Variant = "default" | "primary" | "danger";

interface ButtonProps {
  children?: unknown;
  variant?: Variant;
  ariaLabel?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

type State = { hover: boolean; active: boolean; focus: boolean };

type Action =
  | { type: "HOVER"; value: boolean }
  | { type: "ACTIVE"; value: boolean }
  | { type: "FOCUS"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HOVER":
      return { ...state, hover: action.value };
    case "ACTIVE":
      return { ...state, active: action.value };
    case "FOCUS":
      return { ...state, focus: action.value };
    default:
      return state;
  }
}

const Button = forwardRef<ButtonProps, HTMLButtonElement>(
  (
    { children, variant = "default", ariaLabel, onClick, type = "button" },
    ref
  ) => {
    const [state, dispatch] = useReducer(reducer, {
      hover: false,
      active: false,
      focus: false,
    });

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
      ...(state.hover ? byHover : {}),
      ...(state.active ? byActive : {}),
      ...(state.focus ? styles.buttonFocus : {}),
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        onClick={onClick}
        style={style}
        onMouseEnter={() => dispatch({ type: "HOVER", value: true })}
        onMouseLeave={() => {
          dispatch({ type: "HOVER", value: false });
          dispatch({ type: "ACTIVE", value: false });
        }}
        onMouseDown={() => dispatch({ type: "ACTIVE", value: true })}
        onMouseUp={() => dispatch({ type: "ACTIVE", value: false })}
        onFocus={() => dispatch({ type: "FOCUS", value: true })}
        onBlur={() => dispatch({ type: "FOCUS", value: false })}
      >
        {children}
      </button>
    );
  }
);

export default Button;

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
