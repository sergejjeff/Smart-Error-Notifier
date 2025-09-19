import { initSmartError } from "../packages/sdk/src/index.ts";

const apiUrl = "http://localhost:4000";
const apiKey = process.env.SMART_ERROR_API_KEY!;

const client = initSmartError({ apiUrl, apiKey });

// 1) ручной захват
client.captureException(new Error("Demo error via captureException"));

// 2) необработанное исключение (упадёт процесс)
setTimeout(() => { throw new Error("Unhandled exception demo") }, 500);
