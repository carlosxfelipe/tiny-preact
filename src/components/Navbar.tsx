import { h } from "@lib/tiny-preact.ts";

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath = "#/" }: NavbarProps) {
  const links = [
    { href: "#/", label: "Início" },
    { href: "#/counter", label: "Contador" },
    { href: "#/about", label: "Sobre" },
  ];

  const isActive = (href: string) =>
    href === "#/" ? currentPath === "#/" : currentPath?.startsWith(href);

  return (
    <header class="navbar" role="navigation" aria-label="Principal">
      <div class="nav-inner">
        <a href="#/" class="nav-brand">
          Tiny-preact
        </a>
        <nav class="nav-links">
          {links.map(({ href, label }) => (
            <a
              href={href}
              class="nav-link"
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
