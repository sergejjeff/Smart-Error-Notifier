# @smart-error/sdk (MVP)

Minimal Node.js SDK to report errors to Smart Error Notifier API.

## Install

```bash
npm i @smart-error/sdk
```

## Usage

```ts
import { initSmartError } from "@smart-error/sdk";

const client = initSmartError({
  apiUrl: "http://localhost:4000",
  apiKey: process.env.SMART_ERROR_API_KEY!,
});

// Capture manually
client.captureException(new Error("Something broke"));

// Handlers for uncaughtException / unhandledRejection are installed automatically
```
