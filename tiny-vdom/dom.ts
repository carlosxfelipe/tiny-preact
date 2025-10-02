import type { Props } from "./vdom.ts";

export function isEventProp(name: string) {
  return /^on/.test(name);
}
export function toEventName(name: string) {
  return name.slice(2).toLowerCase();
}
function isBooleanProp(name: string) {
  return ["checked", "disabled", "selected"].includes(name);
}

const NON_DIMENSIONAL = new Set([
  "animationIterationCount",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "floodOpacity",
  "stopOpacity",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
]);

type StyleObj = Record<string, string | number | null | undefined>;

export function setStyle(dom: HTMLElement, next: unknown, prev: unknown) {
  if (typeof next === "string") {
    dom.style.cssText = next;
    return;
  }
  const prevObj =
    prev && typeof prev === "object" ? (prev as StyleObj) : undefined;
  const nextObj =
    next && typeof next === "object" ? (next as StyleObj) : undefined;

  if (prevObj) {
    for (const k in prevObj) {
      if (!nextObj || !(k in nextObj)) {
        if (k.startsWith("--") || k.includes("-")) dom.style.removeProperty(k);
        else (dom.style as unknown as Record<string, string>)[k] = "";
      }
    }
  }
  if (!nextObj) return;

  for (const k in nextObj) {
    let v = nextObj[k];
    if (v == null) {
      if (k.startsWith("--") || k.includes("-")) dom.style.removeProperty(k);
      else (dom.style as unknown as Record<string, string>)[k] = "";
      continue;
    }
    if (typeof v === "number" && !NON_DIMENSIONAL.has(k)) v = `${v}px`;
    if (k.startsWith("--") || k.includes("-"))
      dom.style.setProperty(k, String(v));
    else (dom.style as unknown as Record<string, string>)[k] = String(v);
  }
}

export function setProp(
  dom: Element,
  name: string,
  value: unknown,
  prev: unknown
) {
  const propName = name === "className" ? "class" : name;
  if (propName === "children" || propName === "key") return;

  if (propName === "ref") {
    const cb = value;
    if (typeof cb === "function") (cb as (el: Element | null) => void)(dom);
    else if (cb && typeof cb === "object")
      (cb as { current: Element | null }).current = dom;
    return;
  }

  if (
    propName === "dangerouslySetInnerHTML" &&
    value &&
    typeof value === "object"
  ) {
    const html = (value as { __html?: string }).__html ?? "";
    (dom as HTMLElement).innerHTML = String(html);
    return;
  }

  if (isEventProp(propName)) {
    const ev = toEventName(propName);
    if (typeof prev === "function")
      dom.removeEventListener(ev, prev as EventListener);
    if (typeof value === "function")
      dom.addEventListener(ev, value as EventListener);
    return;
  }

  if (propName === "style") {
    setStyle(dom as HTMLElement, value, prev);
    return;
  }

  const isSvg = dom instanceof SVGElement;
  const el = dom as HTMLElement & Record<string, unknown>;

  if (!isSvg && propName in el && !isBooleanProp(propName)) {
    (el as Record<string, unknown>)[propName] =
      (value as string | number | boolean | null | undefined) ?? "";
  } else if (isBooleanProp(propName)) {
    (el as unknown as Record<string, boolean>)[propName] = !!value;
    if (!value) dom.removeAttribute(propName);
    else dom.setAttribute(propName, "");
  } else {
    if (value == null || value === false) dom.removeAttribute(propName);
    else dom.setAttribute(propName, value === true ? "" : String(value));
  }
}

export function updateProps(dom: Element, prev: Props, next: Props) {
  for (const k in prev) {
    if (!(k in next))
      setProp(dom, k, null, (prev as Record<string, unknown>)[k]);
  }
  for (const k in next) {
    if ((prev as Record<string, unknown>)[k] !== next[k])
      setProp(dom, k, next[k], (prev as Record<string, unknown>)[k]);
  }
}
