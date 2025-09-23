// src/components/Navbar.tsx
import { h } from "@tiny/tiny-vdom.ts";
import Icon from "@icons/Icon.tsx";

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
    href === "#/" ? currentPath === "#/" : currentPath?.startsWith(href);

  return (
    <header class="navbar" role="navigation" aria-label="Principal">
      <div class="nav-inner">
        <a href="#/" class="nav-brand">
          Tiny-vdom
        </a>
        <nav class="nav-links">
          {links.map(({ href, label, icon }) => (
            <a
              href={href}
              class="nav-link"
              aria-current={isActive(href) ? "page" : undefined}
              aria-label={label}
            >
              <Icon name={icon} size={20} aria-hidden="true" />
              <span class="nav-label">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
