import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { AuthenticatedRequest } from "../middleware/auth";
import { computeFingerprint } from "../utils/fingerprint";

export const errorsRouter = Router();

const postSchema = z.object({
  message: z.string().min(1),
  stack: z.string().optional().default(""),
  timestamp: z.coerce.date().optional(),
});

errorsRouter.post("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const { message, stack, timestamp } = parsed.data;
  const userId = req.userId!;
  const fingerprint = computeFingerprint(message, stack);

  const now = timestamp ?? new Date();

  const upserted = await prisma.errorGroup.upsert({
    where: { userId_fingerprint: { userId, fingerprint } },
    create: {
      userId,
      message,
      stack,
      fingerprint,
      occurrencesCount: 1,
      firstSeenAt: now,
      lastSeenAt: now,
    },
    update: {
      occurrencesCount: { increment: 1 },
      lastSeenAt: now,
      // message/stack could be updated to latest sample
      message,
      stack,
    },
  });

  return res.status(201).json(upserted);
});

const getQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z.enum(["NEW", "SEEN", "FIXED"]).optional(),
  q: z.string().optional(),
});

errorsRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const parsed = getQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
  }
  const { from, to, status, q } = parsed.data;
  const userId = req.userId!;

  const where: any = { userId };
  if (status) where.status = status;
  if (from || to) where.lastSeenAt = { gte: from, lte: to };
  if (q) where.message = { contains: q, mode: "insensitive" };

  const items = await prisma.errorGroup.findMany({
    where,
    orderBy: { lastSeenAt: "desc" },
  });
  return res.json(items);
});

const patchSchema = z.object({ status: z.enum(["NEW", "SEEN", "FIXED"]) });

errorsRouter.patch("/:id/status", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = req.params.id;
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const userId = req.userId!;
  const updated = await prisma.errorGroup.update({
    where: { id, userId },
    data: { status: parsed.data.status },
  }).catch(() => null);

  if (!updated) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json(updated);
});
