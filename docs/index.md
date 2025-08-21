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

## What It Does

- Simple in-page terminal with stateful command history.
- Supports basic variable assignment, lookup, and expression eval.
- Built-in commands: `vars`, `clear`, `help`.
- Keyboard: `Enter` to run, `ArrowUp/ArrowDown` to navigate history.

## Supported Inputs

- Assignment: `name = 'John'`, `age = 25`, `active = True`/`False`
- Lookup: `name` (prints the value)
- Expressions: `2 + 3 * 4`, `age + 5`, `active && True`
- Commands:
  - `vars`: list declared variables
  - `clear`: clear output area
  - `help`: show quick help

## API

Component: `Terminal`

- Props: none (v0.1).
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

## Local Development (Repo)

- Dev demo: `npm run dev` → http://localhost:5173/
- Build library: `npm run build:lib`
- Build demo: `npm run build:demo`
- Preview demo: `npm run preview` → http://localhost:4173/

## License

MIT
