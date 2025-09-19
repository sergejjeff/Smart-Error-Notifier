import { fetch } from "undici";

type InitOptions = {
  apiUrl: string;
  apiKey: string;
  onError?: (err: unknown) => void;
};

function toMessageAndStack(err: unknown): { message: string; stack: string } {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack ?? "" };
  }
  try {
    const serialized = JSON.stringify(err);
    return { message: String(err), stack: serialized };
  } catch {
    return { message: String(err), stack: "" };
  }
}

async function postError(apiUrl: string, apiKey: string, payload: { message: string; stack?: string; timestamp?: string }) {
  await fetch(`${apiUrl.replace(/\/$/, "")}/api/errors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    // @ts-ignore keepalive supported by undici fetch
    keepalive: true,
  }).catch(() => undefined);
}

export function initSmartError(options: InitOptions) {
  const { apiUrl, apiKey, onError } = options;

  function handle(err: unknown) {
    const { message, stack } = toMessageAndStack(err);
    postError(apiUrl, apiKey, { message, stack, timestamp: new Date().toISOString() }).finally(() => {
      onError?.(err);
    });
  }

  process.on("uncaughtException", handle);
  process.on("unhandledRejection", handle);

  return {
    captureException(err: unknown) {
      handle(err);
    },
    shutdown() {
      process.off("uncaughtException", handle);
      process.off("unhandledRejection", handle);
    },
  };
}
