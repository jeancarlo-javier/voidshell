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

describe('VoidShell comparisons (Python-style)', () => {
  beforeEach(() => {
    render(<VoidShell />);
  });

  it('evaluates numeric equality/inequality', async () => {
    await typeAndEnter('1 == 1');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('1 != 1');
    expect(screen.getAllByText('False').length).toBeGreaterThan(0);
  });

  it('evaluates relational operators', async () => {
    await typeAndEnter('1 < 2');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('2 <= 2');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('3 > 4');
    expect(screen.getAllByText('False').length).toBeGreaterThan(0);

    await typeAndEnter('3 >= 4');
    expect(screen.getAllByText('False').length).toBeGreaterThan(0);
  });

  it('evaluates boolean comparisons and logic', async () => {
    await typeAndEnter('True == True');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('True != False');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('True and False');
    expect(screen.getAllByText('False').length).toBeGreaterThan(0);

    await typeAndEnter('True or False');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('not True');
    expect(screen.getAllByText('False').length).toBeGreaterThan(0);
  });

  it('compares strings and variables', async () => {
    await typeAndEnter("name = 'John'");
    expect(screen.getByText("name = 'John'"))
      .toBeInTheDocument();

    await typeAndEnter("name == 'John'");
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('age = 25');
    expect(screen.getByText('age = 25')).toBeInTheDocument();

    await typeAndEnter('age == 30');
    expect(screen.getAllByText('False').length).toBeGreaterThan(0);
  });

  it('supports "is" and "is not" for primitives', async () => {
    await typeAndEnter('1 is 1');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);

    await typeAndEnter('1 is not 2');
    expect(screen.getAllByText('True').length).toBeGreaterThan(0);
  });
});
