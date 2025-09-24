# Tiny-vdom

https://tiny-vdom.netlify.app/

<p align="center">
  <img src="./tiny-vdom-logo-transparent-252px.png" alt="Tiny-vdom logo" width="100%" />
</p>

Uma mini-lib **React/Preact-like** super simples (`tiny-vdom.ts`) com `h`, `mount`, `useState`, `useReducer`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `memo` e `forwardRef`.

## Requisitos

- Deno 2.5 ou superior (`deno --version`)

## Começo rápido

```bash
deno task start
# abre http://localhost:8000
```

## JSX (opcional)

O projeto está configurado com **JSX clássico** e `jsxFactory: "h"` no `deno.json`.

- Dentro deste repositório, a pragma é **opcional**.
- Para portabilidade (ex.: arquivo isolado em CDN), você pode usar:

```tsx
/** @jsx h */
```

Também é possível escrever **sem JSX**, usando `h("div", ...)`.

## Recursos

- `h(type, props, ...children)` — cria VNodes (suporta objetos `style`, atributos, e eventos via `onClick`, etc.).
- `mount(vnode, container)` / `render(vnode, container)` — renderer com diff básico **com suporte a keys** (reconciliação chaveada).
- Hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`.

Tipos:

- `JSX.Element` é mapeado para `VNode` via `tiny-vdom/jsx.d.ts`.
- `JSX.IntrinsicElements` é aberto como um índice (`Record<string, unknown>`) para permitir tags HTML e atributos comuns.
- `ref` é suportado em elementos: callback `(el) => void` ou objeto `{ current: Element | null }`.

## Produção

- Gere o bundle e publique tudo que estiver em `dist/`.
- Em CDNs/edge (ou armazenamento de arquivos estáticos), faça upload do conteúdo de `dist/`.

## Licença

Este projeto é licenciado sob os termos da **GNU General Public License v3.0 or later**.

Você pode acessar a licença diretamente [aqui](https://www.gnu.org/licenses/gpl-3.0.txt).

---

> Projeto desenvolvido com ❤️ por
> [@carlosxfelipe](https://github.com/carlosxfelipe). Contribuições são
> bem-vindas!
