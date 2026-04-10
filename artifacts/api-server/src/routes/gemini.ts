import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, geminiSessionsTable, whiskSessionsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { encryptCookiesForUser } from "./admin";

const router: IRouter = Router();

function isPlanActive(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

function daysRemaining(expiresAt: Date | null | undefined): number {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// GET /user/gemini-cookies — extension fetches encrypted Gemini session cookies
router.get("/user/gemini-cookies", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  if ((user.plan || "free").toLowerCase() === "free") {
    res.json({ ok: false, error: "free_plan_no_access", message: "Gemini Pro access requires a Basic or Pro plan." }); return;
  }

  if (!isPlanActive(user.planExpiresAt)) {
    res.json({ ok: false, error: "plan_expired", message: "Your plan has expired. Please renew." }); return;
  }

  const activeSessions = await db.select().from(geminiSessionsTable)
    .where(eq(geminiSessionsTable.isActive, true))
    .orderBy(geminiSessionsTable.createdAt)
    .limit(1);

  if (activeSessions.length === 0) {
    res.json({ ok: true, cookieCount: 0, geminiSystemDisabled: true, user: { id: user.id, plan: user.plan, daysRemaining: daysRemaining(user.planExpiresAt) } }); return;
  }

  const session = activeSessions[0];
  let cookies: object[] = [];
  try { cookies = JSON.parse(session.cookiesJson); } catch { /* empty */ }

  const encryptedCookies = encryptCookiesForUser(cookies, userId);

  res.json({
    ok: true,
    cookieCount: cookies.length,
    encryptedCookies,
    user: { id: user.id, plan: user.plan, daysRemaining: daysRemaining(user.planExpiresAt) },
  });
});

// GET /user/whisk-cookies — dedicated Whisk sessions (separate from Gemini)
router.get("/user/whisk-cookies", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  if ((user.plan || "free").toLowerCase() === "free") {
    res.json({ ok: false, error: "free_plan_no_access", message: "Whisk access requires a Basic or Pro plan." }); return;
  }

  if (!isPlanActive(user.planExpiresAt)) {
    res.json({ ok: false, error: "plan_expired", message: "Your plan has expired. Please renew." }); return;
  }

  const activeSessions = await db.select().from(whiskSessionsTable)
    .where(eq(whiskSessionsTable.isActive, true))
    .orderBy(whiskSessionsTable.createdAt)
    .limit(1);

  if (activeSessions.length === 0) {
    res.json({ ok: true, cookieCount: 0, whiskSystemDisabled: true, user: { id: user.id, plan: user.plan, daysRemaining: daysRemaining(user.planExpiresAt) } }); return;
  }

  const session = activeSessions[0];
  let cookies: object[] = [];
  try { cookies = JSON.parse(session.cookiesJson); } catch { /* empty */ }

  const encryptedCookies = encryptCookiesForUser(cookies, userId);

  res.json({
    ok: true,
    cookieCount: cookies.length,
    encryptedCookies,
    user: { id: user.id, plan: user.plan, daysRemaining: daysRemaining(user.planExpiresAt) },
  });
});

export default router;
