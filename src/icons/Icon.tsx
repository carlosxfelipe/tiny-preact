import { h } from "../tiny-preact.ts";
import { ICONS, type IconName } from "../icons/paths.ts";

type Props = {
  name: IconName;
  size?: number | string;
  class?: string;
  ariaLabel?: string; // se informado, vira role="img"
  title?: string; // opcional: <title> para tooltip/leitores de tela
};

export default function Icon({
  name,
  size = 24,
  class: cls = "",
  ariaLabel,
  title,
}: Props) {
  const d = ICONS[name];
  const px = typeof size === "number" ? String(size) : size;
  const hasLabel = Boolean(ariaLabel);

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      class={cls}
      role={hasLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      aria-hidden={hasLabel ? undefined : "true"}
      fill="currentColor"
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
}
