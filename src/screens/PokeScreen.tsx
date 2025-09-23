import { h, useEffect, useRef, useState } from "@tiny/tiny-vdom.ts";
import { StyleSheet } from "@styles/stylesheet.ts";
import { http } from "@lib/http.ts";
import { getSearch, navigate } from "@src/router/router.ts";

type ApiResult = {
  results: Array<{ name: string; url: string }>;
};

type Pokemon = {
  id: number;
  name: string;
  img: string;
};

const PAGE_SIZE = 25;
const MAX_ITEMS = 150;
const TOTAL_PAGES = Math.ceil(MAX_ITEMS / PAGE_SIZE);

function idFromUrl(url: string): number {
  const m = url.match(/\/pokemon\/(\d+)\/?$/);
  return m ? Number(m[1]) : 0;
}

function artUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default function PokeScreen() {
  const initialPage = Math.max(0, (Number(getSearch().get("page")) || 1) - 1);
  const [page, setPage] = useState(initialPage);
  const [list, setList] = useState<Pokemon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<number, Pokemon[]>>({});

  async function fetchPage(pageIndex: number, signal: AbortSignal) {
    const start = pageIndex * PAGE_SIZE;
    const remaining = Math.max(0, MAX_ITEMS - start);
    const limit = Math.min(PAGE_SIZE, remaining);
    if (limit <= 0) {
      setList([]);
      return;
    }
    if (cacheRef.current[pageIndex]) {
      setList(cacheRef.current[pageIndex]);
      return;
    }
    const { data } = await http.get<ApiResult>(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${start}`,
      { signal }
    );
    const mapped: Pokemon[] = data.results.map((p) => {
      const id = idFromUrl(p.url);
      return { id, name: p.name, img: artUrl(id) };
    });
    cacheRef.current[pageIndex] = mapped;
    setList(mapped);
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    (async () => {
      try {
        setError(null);
        const hasCache = !!cacheRef.current[page];
        if (!hasCache) setLoading(true);
        await fetchPage(page, signal);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError("Falha ao carregar Pokémons.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [page]);

  useEffect(() => {
    const onHash = () => {
      const s = getSearch();
      const p = Math.max(0, (Number(s.get("page")) || 1) - 1);
      setPage(p);
    };
    globalThis.addEventListener("hashchange", onHash);
    return () => globalThis.removeEventListener("hashchange", onHash);
  }, []);

  const goPrev = () => {
    if (page > 0 && !loading) {
      const next = page - 1;
      navigate("#/pokedex", { page: next + 1 });
    }
  };

  const goNext = () => {
    if (page < TOTAL_PAGES - 1 && !loading) {
      const next = page + 1;
      navigate("#/pokedex", { page: next + 1 });
    }
  };

  const canPrev = page > 0 && !loading;
  const canNext = page < TOTAL_PAGES - 1 && !loading;

  return (
    <section>
      <header style={styles.header}>
        <h1 style={styles.title}>Pokédex</h1>
        <p style={styles.subtitle}>
          Dados da{" "}
          <a
            class="link"
            href="https://pokeapi.co/"
            target="_blank"
            rel="noreferrer"
          >
            PokeAPI
          </a>
        </p>
      </header>

      <div style={styles.pager}>
        <button
          type="button"
          style={{ ...styles.pagerBtn, opacity: canPrev ? 1 : 0.5 }}
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Página anterior"
        >
          ◀ Anterior
        </button>
        <span style={styles.pagerLabel}>
          Página {page + 1} / {TOTAL_PAGES}
        </span>
        <button
          type="button"
          style={{ ...styles.pagerBtn, opacity: canNext ? 1 : 0.5 }}
          onClick={goNext}
          disabled={!canNext}
          aria-label="Próxima página"
        >
          Próxima ▶
        </button>
      </div>

      {error ? (
        <div style={styles.error}>{error}</div>
      ) : list.length === 0 && loading ? (
        <GridSkeleton />
      ) : (
        <div style={styles.grid}>
          {list.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardBtn as JSX.StyleObject}>
                <div style={styles.thumbWrap}>
                  <img
                    src={item.img}
                    alt=""
                    width={160}
                    height={160}
                    style={{
                      ...styles.thumb,
                      viewTransitionName: `poke-${item.id}`,
                    }}
                    loading="lazy"
                  />
                </div>
                <span style={styles.name}>{capitalize(item.name)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && list.length > 0 ? (
        <div style={{ textAlign: "center", padding: 12 }}>Carregando…</div>
      ) : null}
    </section>
  );
}

function GridSkeleton() {
  return (
    <div style={styles.grid} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={styles.card}>
          <div style={styles.cardBtn as JSX.StyleObject}>
            <div style={styles.skelImg} />
            <div style={styles.skelText} />
          </div>
        </div>
      ))}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  error: {
    border: "1px solid var(--danger)",
    background: "color-mix(in srgb, var(--danger) 12%, var(--card-bg))",
    color: "var(--fg)",
    padding: 12,
    borderRadius: 12,
    margin: "12px 0",
    fontWeight: 600,
  },
  header: { marginBottom: 16 },
  title: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  subtitle: { margin: 0, color: "var(--muted)", fontSize: 14 },
  pager: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  pagerBtn: {
    appearance: "none",
    border: "1px solid var(--btn-border)",
    background: "var(--btn-bg)",
    color: "var(--fg)",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  pagerLabel: {
    flex: 1,
    textAlign: "center",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16,
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  card: {
    border: "1px solid var(--card-border)",
    background: "var(--card-bg)",
    borderRadius: 14,
    boxShadow: "var(--shadow)",
    overflow: "hidden",
  },
  cardBtn: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    width: "100%",
    textAlign: "center",
    background: "transparent",
    border: 0,
    padding: 12,
    // cursor: "pointer",
    color: "var(--fg)",
  },
  thumbWrap: {
    display: "grid",
    placeItems: "center",
    aspectRatio: "1 / 1",
  },
  thumb: {
    width: "min(160px, 60vw)",
    height: "auto",
    filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.15))",
  },
  name: {
    fontWeight: 700,
    marginTop: 8,
    textTransform: "capitalize",
    color: "var(--fg)",
  },
  skelImg: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "linear-gradient(90deg, #0000, #0001, #0000)",
    backgroundColor: "#0000000a",
    animation: "skel 1.2s infinite",
    borderRadius: 12,
  },
  skelText: {
    height: 14,
    marginTop: 10,
    background: "#00000010",
    borderRadius: 6,
  },
});
