import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor ---

test("shows 'Creating' label for str_replace_editor create command", () => {
  const tool: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor str_replace command", () => {
  const tool: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/components/Card.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor insert command", () => {
  const tool: ToolInvocation = {
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/Button.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Editing Button.jsx")).toBeDefined();
});

test("shows 'Reading' label for str_replace_editor view command", () => {
  const tool: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Reading App.jsx")).toBeDefined();
});

// --- file_manager ---

test("shows 'Renaming' label for file_manager rename command", () => {
  const tool: ToolInvocation = {
    toolCallId: "5",
    toolName: "file_manager",
    args: { command: "rename", path: "/Foo.jsx", new_path: "/Bar.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Renaming Foo.jsx → Bar.jsx")).toBeDefined();
});

test("shows 'Deleting' label for file_manager delete command", () => {
  const tool: ToolInvocation = {
    toolCallId: "6",
    toolName: "file_manager",
    args: { command: "delete", path: "/OldComponent.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Deleting OldComponent.jsx")).toBeDefined();
});

// --- unknown tool ---

test("falls back to tool name for unknown tools", () => {
  const tool: ToolInvocation = {
    toolCallId: "7",
    toolName: "some_other_tool",
    args: {},
    state: "call",
  };
  render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

// --- loading vs done state ---

test("shows spinner when tool is in-progress", () => {
  const tool: ToolInvocation = {
    toolCallId: "8",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationBadge tool={tool} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when tool has completed with a result", () => {
  const tool: ToolInvocation = {
    toolCallId: "9",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "File created",
  };
  const { container } = render(<ToolInvocationBadge tool={tool} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when tool state is result but result is empty", () => {
  const tool: ToolInvocation = {
    toolCallId: "10",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "",
  };
  const { container } = render(<ToolInvocationBadge tool={tool} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
