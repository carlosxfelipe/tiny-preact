import { h } from "@tiny/index.ts";
import { ICONS, type IconName } from "@icons/paths.ts";

type Props = {
  name: IconName;
  size?: number | string;
  class?: string;
  ariaLabel?: string; // if provided, role="img" will be applied
  title?: string; // optional: <title> for tooltip/screen readers
  color?: string;
};

export default function Icon({
  name,
  size = 24,
  class: cls = "",
  ariaLabel,
  title,
  color,
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
      fill={color ?? "currentColor"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
}
