import { h, useState, useEffect } from "@tiny/index.ts";
import Icon from "@icons/Icon.tsx";
import Logo from "./Logo.tsx";

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath = "#/" }: NavbarProps) {
  const links = [
    { href: "#/", label: "Início", icon: "home" as const },
    { href: "#/counter", label: "Contador", icon: "plus" as const },
    { href: "#/pokedex", label: "Pokédex", icon: "pokeball" as const },
    { href: "#/about", label: "Sobre", icon: "help-circle-outline" as const },
  ];

  const isActive = (href: string) =>
    href === "#/" ? currentPath === "#/" : currentPath.startsWith(href);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setOpen(false);
    globalThis.addEventListener?.("hashchange", onHash);
    return () => globalThis.removeEventListener?.("hashchange", onHash);
  }, []);

  return (
    <header class="navbar" role="navigation" aria-label="Principal">
      <div class="nav-inner">
        <a href="#/" class="nav-brand" aria-label="Página inicial Tiny-vdom">
          <Logo height={28} showText />
        </a>

        <nav class="nav-links">
          {links.map(({ href, label, icon }) => (
            <a
              href={href}
              class={`nav-link${isActive(href) ? " active" : ""}`}
              aria-current={isActive(href) ? "page" : undefined}
              aria-label={label}
            >
              <Icon name={icon} size={20} aria-hidden="true" />
              <span class="nav-label">{label}</span>
            </a>
          ))}
        </nav>

        <button
          type="button"
          class="nav-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} size={20} aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div id="nav-menu" class="nav-menu" role="menu">
          {links.map(({ href, label, icon }) => (
            <a
              href={href}
              role="menuitem"
              class={`nav-menu-item${isActive(href) ? " active" : ""}`}
              aria-current={isActive(href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon name={icon} size={18} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
