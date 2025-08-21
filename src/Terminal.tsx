import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

type VarValue = string | number | boolean;

type HistoryEntryType = "input" | "output" | "error";

interface HistoryEntry {
  type: HistoryEntryType;
  content: string;
}

type Commands = Record<string, () => string>;

const Terminal: React.FC = () => {
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
<expression>       - Evaluate math/comparisons/logic (e.g., 2 + 3 * 4, 1 == 1, True and not False, 1 is not 2)
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
    // Variable assignment: make sure it's a single '=' (not '==', '>=', etc.)
    const assignmentMatch = trimmedInput.match(
      /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)\s*(.+)$/
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

    // Check for expression evaluation (math, comparisons, booleans)
    try {
      // Prepare expression (Python-like booleans/operators → JS)
      const prepareExpression = (expr: string): string => {
        let e = expr;
        // Replace Python boolean literals with JS booleans
        e = e.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
        // Replace logical operators (word boundaries)
        e = e.replace(/\bis not\b/g, '!==');
        e = e.replace(/\bis\b/g, '===');
        e = e.replace(/\band\b/g, '&&');
        e = e.replace(/\bor\b/g, '||');
        // Unary not: ensure we don't break existing operators
        e = e.replace(/\bnot\b/g, '!');
        return e;
      };

      // Replace variables in the expression with their values
      let expression = trimmedInput;
      for (const [varName, value] of Object.entries(variables) as [
        string,
        VarValue
      ][]) {
        const regex = new RegExp(`\\b${varName}\\b`, "g");
        const replacement =
          typeof value === "number"
            ? String(value)
            : typeof value === "boolean"
            ? String(value)
            : `"${value}"`;
        expression = expression.replace(regex, replacement);
      }

      // Apply Python → JS operator/literal conversions
      expression = prepareExpression(expression);

      // Only evaluate if it looks like an expression (numbers, variables, operators)
      if (/^[\d+\-*/%().\s"'a-zA-Z_!=<>]+$/.test(trimmedInput)) {
        const result = Function(`"use strict"; return (${expression})`)() as
          | string
          | number
          | boolean;
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content:
              typeof result === "boolean"
                ? result
                  ? "True"
                  : "False"
                : String(result),
          },
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
      className="voidshell"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="voidshell__header">
        Terminal v1.0 - Type 'help' for commands
      </div>

      {/* Terminal output */}
      <div ref={terminalRef} className="voidshell__history">
        {history.map((entry, index) => (
          <div
            key={index}
            className={`voidshell__entry ${
              entry.type === "input"
                ? "voidshell__entry--input"
                : entry.type === "error"
                ? "voidshell__entry--error"
                : "voidshell__entry--output"
            }`}
          >
            {entry.content}
          </div>
        ))}

        {/* Current input line */}
        <div className="voidshell__current">
          <span className="voidshell__prompt">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="voidshell__input"
            spellCheck="false"
            autoComplete="off"
          />
          <span className="voidshell__cursor">|</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
