VoidShell
=========

Minimal terminal-like React component packaged as a reusable library.

Install
-------

This repo is set up as a Vite + TypeScript React library. After cloning:

1. Install deps: `npm i`
2. Build the package: `npm run build`

Usage
-----

Import the component in your React app:

```tsx
// Recommended: default export
import VoidShell from 'voidshell';

// Or name it however you like
// import Terminal from 'voidshell';
// import { Terminal } from 'voidshell';
// import { MinimalistTerminal } from 'voidshell';

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <VoidShell />
    </div>
  );
}
```

Notes
-----

- The component uses Tailwind-like utility classes for styling, but does not bundle Tailwind. Consumers can style or override as needed.
- `react` and `react-dom` are peer dependencies and must be provided by the consuming app.
