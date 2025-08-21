import React from 'react';
import { MinimalistTerminal } from '../src';

export default function App() {
  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'sans-serif' }}>VoidShell Demo</h1>
      <p style={{ fontFamily: 'sans-serif', color: '#555' }}>
        Type 'help' in the terminal below to see available commands.
      </p>
      <MinimalistTerminal />
    </div>
  );
}

