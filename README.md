# Tiny-vdom

https://tiny-vdom.netlify.app/

Uma mini-lib **React/Preact-like** super simples (`tiny-vdom.ts`) com `h`, `mount`, `useState`, `useReducer`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `memo` e `forwardRef`.

## Requisitos

- Deno 2.5 ou superior (`deno --version`)

## Instalação

Instale o runtime do **Deno** no seu sistema usando um dos comandos abaixo.  
Há diversas maneiras de instalar o Deno — uma lista completa pode ser encontrada [aqui](https://docs.deno.com/runtime/manual/getting_started/installation).

### Shell (Mac, Linux)

```sh
curl -fsSL https://deno.land/install.sh | sh
```

### PowerShell (Windows)

```powershell
irm https://deno.land/install.ps1 | iex
```

### [Homebrew](https://formulae.brew.sh/formula/deno) (Mac)

```sh
brew install deno
```

### [Chocolatey](https://chocolatey.org/packages/deno) (Windows)

```powershell
choco install deno
```

### [WinGet](https://winstall.app/apps/DenoLand.Deno) (Windows)

```powershell
winget install --id=DenoLand.Deno
```

## Extensão para VSCode

Recomenda-se instalar a extensão [**Deno for VSCode (denoland.vscode-deno)**](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

### Benefícios da extensão:

- **Suporte a TypeScript e JSX:** fornece tipagem aprimorada e melhor autocompletar.  
- **Linting e formatação automática:** ajuda a manter um padrão de código consistente.  
- **Execução integrada:** permite rodar e depurar projetos Deno diretamente do VSCode.  
- **Importações otimizadas:** detecta módulos de forma nativa, simplificando o desenvolvimento.  
- **Melhor experiência com hooks e JSX do tiny-vdom:** aumenta a produtividade no uso da mini-lib.

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
