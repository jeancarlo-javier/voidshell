VoidShell
=========

Minimal terminal-like React component packaged as a reusable library.

Features (v0.2)
---------------

- Python-style booleans: `True`, `False` (printed in Python casing).
- Comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=` on numbers, strings, and variables.
- Logic operators: `and`, `or`, `not`.
- Identity keywords: `is`, `is not` for primitive comparisons.
- Variables: assign with `<var> = <value>`, read with `<var>`.
- Built-ins: `vars`, `clear`, `help`.

Install
-------

This repo is set up as a Vite + TypeScript React library. After cloning:

1. Install deps: `npm i`
2. Build the package: `npm run build`

Usage
-----

Import the component in your React app:

```tsx
import { VoidShell } from 'voidshell';
// Optional: use default styles provided by the library
import 'voidshell/styles.css';

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <VoidShell />
    </div>
  );
}
```

Examples
--------

General command forms (Python-like syntax):

- Assignment: `<name> = <value>` (value: number | 'string' | True | False)
- Lookup: `<name>` (prints the current value)
- Math: `<number-expr>` (e.g., `(<num|var>) (+|-|*|/|%) (<num|var>)`)
- Comparisons: `<expr> (== | != | < | <= | > | >=) <expr>`
- Logic: `<bool-expr> and <bool-expr>`, `<bool-expr> or <bool-expr>`, `not <bool-expr>`
- Identity: `<expr> is <expr>`, `<expr> is not <expr>`
- Built-ins: `vars`, `clear`, `help`

Quick demo:

```
$ name = 'Ada'
$ age = 25
$ age >= 18            → True
$ True and not False   → True
$ name is not 'Alan'   → True
$ name == 'Ada'        → True
$ vars
name = 'Ada'
age = 25
```

Styling
-------

- Default styles: Import `voidshell/styles.css` (shown above). This applies visuals equivalent to the Tailwind utilities used originally (black background, green monospace text, etc.).
- Custom styles: Skip importing the CSS and style via the component’s semantic class names:
  - `.voidshell` – root container
  - `.voidshell__header` – header bar
  - `.voidshell__history` – scrollable output area
  - `.voidshell__entry` – output line; modifiers: `--input`, `--output`, `--error`
  - `.voidshell__current` – current input row
  - `.voidshell__prompt` – `$` prompt
  - `.voidshell__input` – text input
  - `.voidshell__cursor` – blinking cursor

You can also override CSS variables scoped on `.voidshell` to theme quickly:

```
.voidshell {
  --vs-bg: #000;          /* background */
  --vs-fg: #4ade80;       /* primary text */
  --vs-fg-dim: #86efac;   /* secondary text */
  --vs-border: #4ade80;   /* border color */
  --vs-error: #f87171;    /* error text */
}
```

Notes
-----

- The component exposes semantic class names; default CSS mimics the original Tailwind-like look but Tailwind itself is not bundled.
- `react` and `react-dom` are peer dependencies and must be provided by the consuming app.
- Chained comparisons like `1 < 2 < 3` follow JS semantics (not Python’s); they are not specially handled.
