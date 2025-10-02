import { h } from "@tiny/index.ts";
import type { Child } from "@tiny/index.ts";
import Navbar from "@components/Navbar.tsx";
import { StyleSheet } from "@styles/stylesheet.ts";

interface LayoutProps {
  children?: Child | Child[];
  fluid?: boolean;
  currentPath?: string;
  showNavbar?: boolean;
}

export default function Layout({
  children = [],
  fluid = false,
  currentPath,
  showNavbar = true,
}: LayoutProps) {
  return (
    <div>
      {showNavbar ? <Navbar currentPath={currentPath} /> : null}
      <main
        key={`main:${currentPath ?? ""}`}
        style={{
          ...styles.page,
          ...(fluid ? styles.pageFluid : {}),
          viewTransitionName: "page",
        }}
      >
        {children}
      </main>
    </div>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "min(100%, 1024px)",
    margin: "0 auto",
    padding: "24px clamp(14px, 4vw, 16px) 32px",
    paddingTop: "calc(24px + env(safe-area-inset-top))",
  },
  pageFluid: { width: "100%", maxWidth: "none" },
});
