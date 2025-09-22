import { h, useEffect, useRef, useState } from "@tiny/tiny-vdom.ts";
import { StyleSheet } from "@styles/stylesheet.ts";

type Key = string | number;

type FlatListProps<T> = {
  data: T[];
  renderItem: (opts: { item: T; index: number }) => JSX.Element;
  keyExtractor?: (item: T, index: number) => Key;
  ListHeaderComponent?: () => JSX.Element | null;
  ListFooterComponent?: () => JSX.Element | null;
  ListEmptyComponent?: () => JSX.Element | null;
  ItemSeparatorComponent?: () => JSX.Element | null;
  horizontal?: boolean;
  style?: JSX.StyleObject;
  contentContainerStyle?: JSX.StyleObject;
  onEndReached?: () => void | Promise<void>;
  onEndReachedThreshold?: number; // px from the end (default ~2 items)
  loading?: boolean; // optional: when true, prevents re-triggering onEndReached and sets aria-busy
};

export default function FlatList<T>({
  data,
  renderItem,
  keyExtractor = (_i, idx) => idx,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  ItemSeparatorComponent,
  horizontal = false,
  style,
  contentContainerStyle,
  onEndReached,
  onEndReachedThreshold = 240,
  loading = false,
}: FlatListProps<T>) {
  // Use Element for refs to align with tiny-vdom's ref typing ({ current: Element | null }).
  const scrollerRef = useRef<Element | null>(null);
  const sentinelRef = useRef<Element | null>(null);

  const [sentinelReached, setSentinelReached] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const inFlightRef = useRef(false); // guards concurrent onEndReached calls

  // Prefer IntersectionObserver; fall back to scroll listeners when unavailable.
  useEffect(() => {
    if (!onEndReached) return;
    // Avoid running in non-DOM environments (SSR/hydration).
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    // Clean up any previous observer
    observerRef.current?.disconnect();

    if ("IntersectionObserver" in globalThis) {
      // Root margin is aligned to the primary axis (Y for vertical, X for horizontal lists)
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries)
            if (e.isIntersecting) setSentinelReached(true);
        },
        {
          root: (scrollerRef.current as Element) || null,
          rootMargin: horizontal
            ? `0px ${onEndReachedThreshold}px 0px 0px`
            : `0px 0px ${onEndReachedThreshold}px 0px`,
        }
      );
      if (sentinelRef.current) io.observe(sentinelRef.current as Element);
      observerRef.current = io;
      return () => io.disconnect();
    }

    // Scroll fallback (handles both vertical and horizontal axes)
    const el =
      (scrollerRef.current as HTMLElement | null) || document.documentElement;

    const onScroll = () => {
      const scrollable =
        (scrollerRef.current as HTMLElement | null) || document.documentElement;

      const distToEnd = horizontal
        ? scrollable.scrollWidth -
          (scrollable.scrollLeft + scrollable.clientWidth)
        : scrollable.scrollHeight -
          (scrollable.scrollTop + scrollable.clientHeight);

      if (distToEnd <= onEndReachedThreshold) setSentinelReached(true);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onEndReached, onEndReachedThreshold, horizontal]);

  // Fire onEndReached when sentinel is reached; protect against concurrent calls.
  useEffect(() => {
    if (!sentinelReached) return;
    setSentinelReached(false);

    if (loading || inFlightRef.current) return;

    if (onEndReached) {
      inFlightRef.current = true;
      Promise.resolve(onEndReached()).finally(() => {
        inFlightRef.current = false;
      });
    }
  }, [sentinelReached, onEndReached, loading]);

  const isEmpty = data.length === 0;

  // Axis-specific overflow for better UX in horizontal lists.
  const axisOverflow: JSX.StyleObject = horizontal
    ? { overflowX: "auto", overflowY: "hidden" }
    : { overflowY: "auto" };

  return (
    <div
      // The scroller can be the root container: IO uses this as `root` when present.
      ref={scrollerRef}
      // `role="list"` helps screen readers; `aria-busy` reflects loading state on infinite scroll.
      role="list"
      aria-busy={loading ? "true" : "false"}
      style={StyleSheet.merge(
        styles.scroll,
        axisOverflow,
        horizontal ? styles.row : styles.col,
        style
      )}
    >
      <div
        style={StyleSheet.merge(
          styles.inner,
          horizontal ? styles.row : styles.col,
          contentContainerStyle
        )}
      >
        {ListHeaderComponent ? <ListHeaderComponent /> : null}

        {isEmpty && ListEmptyComponent ? (
          <ListEmptyComponent />
        ) : (
          data.map((item, index) => {
            const key = keyExtractor(item, index);
            return (
              <div key={key} role="listitem">
                {renderItem({ item, index })}
                {ItemSeparatorComponent && index < data.length - 1 ? (
                  <ItemSeparatorComponent />
                ) : null}
              </div>
            );
          })
        )}

        {ListFooterComponent ? <ListFooterComponent /> : null}

        {/* Invisible sentinel to trigger onEndReached (observed via IO or reached via scroll distance) */}
        <div ref={sentinelRef} style={styles.sentinel} aria-hidden="true" />
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
    maxHeight: "unset", // Change to something like 60vh for a self-scrolling list viewport
    // Note: axis-specific overflow is merged dynamically (see axisOverflow).
  },
  inner: {
    display: "flex",
    gap: 8,
  },
  row: { flexDirection: "row" } as JSX.StyleObject,
  col: { flexDirection: "column" } as JSX.StyleObject,
  sentinel: { width: 1, height: 1, opacity: 0 },
});
