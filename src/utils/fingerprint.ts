import crypto from "crypto";

function normalizeStack(stack: string): string {
  // Remove line/column numbers like (:123:45) and absolute paths
  return stack
    .replace(/:\d+:\d+/g, ":_:_")
    .replace(/:\d+/g, ":_")
    .replace(/[A-Z]:\\[^\s)]+/gi, "<path>")
    .replace(/\/[^\s)]+/g, "<path>")
    .toLowerCase();
}

export function computeFingerprint(message: string, stack: string): string {
  const h = crypto.createHash("sha256");
  h.update(message.trim());
  h.update("||");
  h.update(normalizeStack(stack || ""));
  return h.digest("hex");
}
