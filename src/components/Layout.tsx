import { h } from "@tiny/tiny-preact.ts";
import type { Child } from "@tiny/tiny-preact.ts";
import Navbar from "@components/Navbar.tsx";
import { StyleSheet } from "@styles/stylesheet.ts";

interface LayoutProps {
  children?: Child | Child[];
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
      <main
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
  pageFluid: {
    width: "100%",
    maxWidth: "none",
  },
});
