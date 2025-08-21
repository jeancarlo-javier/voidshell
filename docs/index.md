# VoidShell Docs

Minimal terminal-like React component packaged as a reusable library.

## Installation

- npm: `npm i voidshell`
- pnpm: `pnpm add voidshell`
- yarn: `yarn add voidshell`

Peer dependencies (not installed by the package): `react`, `react-dom` (v17+ recommended v18).

## Quick Start

```tsx
import { VoidShell } from "voidshell";

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <VoidShell />
    </div>
  );
}
```

## Styling

There are two ways to style VoidShell:

- Default styles: Import the optional stylesheet exposed by the package. This applies a Tailwind-like terminal look (black background, green monospace text) without requiring Tailwind.

```tsx
import { VoidShell } from 'voidshell';
import 'voidshell/styles.css';

export default function App() {
  return <VoidShell />;
}
```

- Custom styles: Do not import the stylesheet and instead target the semantic class names in your own CSS. You can also override CSS variables for quick theming.

Semantic classes:

- `.voidshell` – root container
- `.voidshell__header` – header bar
- `.voidshell__history` – scrollable output area
- `.voidshell__entry` – output line; modifiers: `--input`, `--output`, `--error`
- `.voidshell__current` – current input row
- `.voidshell__prompt` – `$` prompt
- `.voidshell__input` – text input
- `.voidshell__cursor` – blinking cursor

Theme via CSS variables on `.voidshell`:

```
.voidshell {
  --vs-bg: #000;          /* background */
  --vs-fg: #4ade80;       /* primary text */
  --vs-fg-dim: #86efac;   /* secondary text */
  --vs-border: #4ade80;   /* border color */
  --vs-error: #f87171;    /* error text */
}
```

## What It Does

- Simple in-page terminal with stateful command history.
- Supports variable assignment, lookup, and expression evaluation with Python-like syntax.
- Built-in commands: `vars`, `clear`, `help`.
- Keyboard: `Enter` to run, `ArrowUp/ArrowDown` to navigate history.

## Supported Inputs

- Assignment: `name = 'John'`, `age = 25`, `active = True`/`False`
- Lookup: `name` (prints the value)
- Expressions:
  - Math: `2 + 3 * 4`, `age + 5`
  - Comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=` (e.g., `1 == 1`, `name == 'John'`)
  - Logic: `and`, `or`, `not` (e.g., `True and not False`)
  - Identity: `is`, `is not` for primitives (e.g., `1 is not 2`)
- Commands:
  - `vars`: list declared variables
  - `clear`: clear output area
  - `help`: show quick help

## API

Component: `VoidShell`

- Props: none (v0.2).
- Render: self-contained terminal UI. Size/layout can be controlled by wrapping container styles.

Note: Future versions may expose props for theme, initial history, custom commands, and styling hooks.

## Styling Notes

- Uses utility-like class names (Tailwind-esque) for default look, but Tailwind is not required.
- Wrap with your own container to control height/width. Example:

```tsx
<div style={{ height: 384, width: "100%" }}>
  <VoidShell />
</div>
```

## TypeScript

- Ships type declarations. Import via named export: `import { VoidShell } from 'voidshell'`.

## Security Considerations

- Expression evaluation is deliberately constrained, but still uses `Function(...)` to evaluate simple expressions.
- Do not expose this terminal to untrusted user input without additional safeguards.

### Notes

- Booleans are printed as `True`/`False` (Python style).
- Chained comparisons like `1 < 2 < 3` are not specially handled (JS semantics apply).

## Local Development (Repo)

- Dev demo: `npm run dev` → http://localhost:5173/
- Build library: `npm run build:lib`
- Build demo: `npm run build:demo`
- Preview demo: `npm run preview` → http://localhost:4173/

## License

MIT
