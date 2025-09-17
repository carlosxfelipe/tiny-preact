import { h } from "../tiny-preact.ts";
import Navbar from "./Navbar.tsx";
import type { Child } from "../tiny-preact.ts";

interface LayoutProps {
  children?: Child[];
  fluid?: boolean;
  currentPath?: string;
}

export default function Layout({
  children = [],
  fluid = false,
  currentPath,
}: LayoutProps) {
  return (
    <div>
      <Navbar currentPath={currentPath} />
      <main class={`page ${fluid ? "page-fluid" : ""}`}>{children}</main>
    </div>
  );
}
