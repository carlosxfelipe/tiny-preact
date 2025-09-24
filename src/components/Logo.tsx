import { h } from "@tiny/tiny-vdom.ts";

type LogoProps = {
  height?: number | string;
  showText?: boolean;
  gap?: number;
  ariaLabel?: string;
  class?: string;
};

export default function Logo({
  height = 28,
  showText = false,
  gap = 8,
  ariaLabel,
  class: cls = "",
}: LogoProps) {
  const px = typeof height === "number" ? `${height}` : height;
  const labeled = Boolean(ariaLabel);

  return (
    <span
      class={cls}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        lineHeight: 0,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        height={px}
        role={labeled ? "img" : "presentation"}
        aria-label={ariaLabel}
        aria-hidden={labeled ? undefined : "true"}
        focusable="false"
        style={{ borderRadius: 12 }}
      >
        <title>Tiny-vdom</title>
        <rect x="2" y="2" width="60" height="60" rx="14" fill="none" />
        <g
          fill="none"
          stroke="var(--primary)"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="18,22 10,32 18,42" />
          <line x1="40" y1="18" x2="24" y2="46" />
          <polyline points="46,22 54,32 46,42" />
        </g>
      </svg>

      {showText ? (
        <span
          style={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--fg)",
            fontSize: "18px",
            lineHeight: 1,
          }}
        >
          Tiny-vdom
        </span>
      ) : null}
    </span>
  );
}
