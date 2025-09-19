import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = registerSchema;

authRouter.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  return res.status(201).json({ id: user.id, email: user.email });
});

authRouter.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT secret not configured" });
  }
  const token = jwt.sign({ sub: user.id }, secret, { expiresIn: "7d" });
  return res.json({ token });
});

