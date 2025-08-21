import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { VoidShell } from '../src';

const typeAndEnter = async (text: string) => {
  const input = screen.getByRole('textbox');
  await userEvent.clear(input);
  await userEvent.type(input, text);
  await userEvent.keyboard('{Enter}');
};

describe('VoidShell', () => {
  beforeEach(() => {
    render(<VoidShell />);
  });

  it('renders header and focuses input', async () => {
    expect(
      screen.getByText("Terminal v1.0 - Type 'help' for commands")
    ).toBeInTheDocument();

    const input = screen.getByRole('textbox') as HTMLInputElement;
    // Focus is set on mount; jsdom focus is limited but verify no crash and element exists
    expect(input).toBeInTheDocument();
  });

  it('shows help output', async () => {
    await typeAndEnter('help');
    expect(screen.getByText(/Available commands:/i)).toBeInTheDocument();
    expect(screen.getByText(/vars\s+- List all declared variables/)).toBeInTheDocument();
  });

  it('handles vars when empty', async () => {
    await typeAndEnter('vars');
    expect(screen.getByText('No variables declared')).toBeInTheDocument();
  });

  it('assigns and reads string variable', async () => {
    await typeAndEnter("name = 'John'");
    expect(screen.getByText("name = 'John'")).toBeInTheDocument();

    await typeAndEnter('name');
    // Reading variable prints formatted value with quotes
    expect(screen.getByText("'John'"))
      .toBeInTheDocument();
  });

  it('evaluates math expressions', async () => {
    await typeAndEnter('2 + 3 * 4');
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('uses variables inside expressions', async () => {
    await typeAndEnter('age = 25');
    expect(screen.getByText('age = 25')).toBeInTheDocument();

    await typeAndEnter('age + 5');
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('shows error for unknown command', async () => {
    await typeAndEnter('foo bar');
    expect(screen.getByText('Command not found: foo bar')).toBeInTheDocument();
  });

  it('clears output with clear command', async () => {
    await typeAndEnter("name = 'Alice'");
    expect(screen.getByText("name = 'Alice'"))
      .toBeInTheDocument();

    await typeAndEnter('clear');

    // After clear, previous output should not be present
    expect(screen.queryByText("name = 'Alice'"))
      .not.toBeInTheDocument();
  });

  it('navigates command history with arrow keys', async () => {
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await userEvent.type(input, 'first');
    await userEvent.keyboard('{Enter}');
    await userEvent.type(input, 'second');
    await userEvent.keyboard('{Enter}');

    // Up should recall 'second'
    await userEvent.keyboard('{ArrowUp}');
    expect(input.value).toBe('second');

    // Up again should recall 'first'
    await userEvent.keyboard('{ArrowUp}');
    expect(input.value).toBe('first');

    // Down should go back to 'second'
    await userEvent.keyboard('{ArrowDown}');
    expect(input.value).toBe('second');

    // Down at end should clear to empty
    await userEvent.keyboard('{ArrowDown}');
    expect(input.value).toBe('');
  });
});
