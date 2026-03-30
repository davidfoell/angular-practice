import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  tool: ToolInvocation;
}

function getLabel(tool: ToolInvocation): string {
  const args = tool.args as Record<string, string>;
  const path = args?.path ?? "";
  const filename = path.split("/").filter(Boolean).pop() || path;

  if (tool.toolName === "str_replace_editor") {
    const command = args?.command;
    if (command === "create") return `Creating ${filename}`;
    if (command === "str_replace" || command === "insert") return `Editing ${filename}`;
    if (command === "view") return `Reading ${filename}`;
    return filename ? `Editing ${filename}` : "Editing file";
  }

  if (tool.toolName === "file_manager") {
    const command = args?.command;
    if (command === "rename") {
      const newPath = args?.new_path ?? "";
      const newFilename = newPath.split("/").filter(Boolean).pop() || newPath;
      return `Renaming ${filename} → ${newFilename}`;
    }
    if (command === "delete") return `Deleting ${filename}`;
  }

  return tool.toolName;
}

export function ToolInvocationBadge({ tool }: ToolInvocationBadgeProps) {
  const isDone = tool.state === "result" && tool.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{getLabel(tool)}</span>
    </div>
  );
}
