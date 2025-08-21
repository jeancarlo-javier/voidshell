import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

type VarValue = string | number | boolean;

type HistoryEntryType = "input" | "output" | "error";

interface HistoryEntry {
  type: HistoryEntryType;
  content: string;
}

type Commands = Record<string, () => string>;

const MinimalistTerminal: React.FC = () => {
  const [variables, setVariables] = useState<Record<string, VarValue>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentInput, setCurrentInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  // Parse and convert Python-like values
  const parseValue = (valueStr: string): VarValue => {
    const trimmed = valueStr.trim();

    // Handle strings (quoted)
    if (
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      return trimmed.slice(1, -1);
    }

    // Handle booleans
    if (trimmed === "True") return true;
    if (trimmed === "False") return false;

    // Handle numbers
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);

    // Default to string
    return trimmed;
  };

  const formatValue = (value: VarValue): string => {
    if (typeof value === "string") return `'${value}'`;
    if (typeof value === "boolean") return value ? "True" : "False";
    return value.toString();
  };

  // Built-in commands
  const commands: Commands = {
    vars: () => {
      const varList = Object.keys(variables);
      if (varList.length === 0) return "No variables declared";
      return varList
        .map((key) => `${key} = ${formatValue(variables[key])}`)
        .join("\n");
    },

    clear: () => {
      setHistory([]);
      return "";
    },

    help: () => {
      return `Available commands:
<var> = <value>    - Declare variable (e.g., name = 'John', age = 25, active = True)
<var>              - Display variable value
<expression>       - Evaluate math expression (e.g., 2 + 3 * 4)
vars               - List all declared variables
clear              - Clear terminal output
help               - Show this help message`;
    },
  };

  const executeCommand = (input: string): void => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add to command history
    setCommandHistory((prev) => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    // Add input to display history
    setHistory((prev) => [
      ...prev,
      { type: "input", content: `$ ${trimmedInput}` },
    ]);

    // Check for variable assignment (e.g., "name = 'John'", "age = 25")
    const assignmentMatch = trimmedInput.match(
      /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/
    );
    if (assignmentMatch) {
      const [, varName, valueStr] = assignmentMatch as RegExpMatchArray;
      const value = parseValue(valueStr);
      setVariables((prev) => ({ ...prev, [varName]: value }));
      setHistory((prev) => [
        ...prev,
        { type: "output", content: `${varName} = ${formatValue(value)}` },
      ]);
      return;
    }

    // Check for built-in commands first
    const command = trimmedInput.toLowerCase();
    if (command in commands) {
      const output = commands[command]!();
      if (output) {
        setHistory((prev) => [...prev, { type: "output", content: output }]);
      }
      return;
    }

    // Check for variable lookup (just variable name)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedInput)) {
      if (trimmedInput in variables) {
        setHistory((prev) => [
          ...prev,
          { type: "output", content: formatValue(variables[trimmedInput]) },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          { type: "error", content: `Variable "${trimmedInput}" not found` },
        ]);
      }
      return;
    }

    // Check for math expression (contains numbers, variables, and operators)
    try {
      // Replace variables in the expression with their values
      let expression = trimmedInput;
      for (const [varName, value] of Object.entries(variables) as [
        string,
        VarValue
      ][]) {
        const regex = new RegExp(`\\b${varName}\\b`, "g");
        expression = expression.replace(
          regex,
          typeof value === "number" ? String(value) : `"${value}"`
        );
      }

      // Only evaluate if it looks like a math expression or contains variables
      if (/^[\d+\-*/%().\s"'a-zA-Z_]+$/.test(trimmedInput)) {
        const result = Function(`"use strict"; return (${expression})`)() as
          | string
          | number
          | boolean;
        setHistory((prev) => [
          ...prev,
          { type: "output", content: result.toString() },
        ]);
        return;
      }
    } catch (error) {
      // If expression evaluation fails, fall through to command not found
    }

    // Command not found
    setHistory((prev) => [
      ...prev,
      { type: "error", content: `Command not found: ${trimmedInput}` },
    ]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      executeCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="bg-black text-green-400 font-mono text-sm h-96 w-full border border-green-400 flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="border-b border-green-400 px-2 py-1 text-xs">
        Terminal v1.0 - Type 'help' for commands
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 space-y-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#22c55e #000000" }}
      >
        {history.map((entry, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap ${
              entry.type === "input"
                ? "text-green-400"
                : entry.type === "error"
                ? "text-red-400"
                : "text-green-300"
            }`}
          >
            {entry.content}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-green-400 mr-1">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-green-400 outline-none flex-1 font-mono"
            spellCheck="false"
            autoComplete="off"
          />
          <span className="animate-pulse text-green-400">|</span>
        </div>
      </div>
    </div>
  );
};

export default MinimalistTerminal;
