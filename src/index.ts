import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { errorsRouter } from "./routes/errors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/errors", errorsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
