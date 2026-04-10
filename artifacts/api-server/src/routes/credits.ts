import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, creditTransactionsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const PLAN_CREDITS_MAP: Record<string, { total: number; resetDays: number }> = {
  free:      { total: 500,    resetDays: 30 },
  basic:     { total: 5000,   resetDays: 30 },
  starter:   { total: 25000,  resetDays: 30 },
  pro:       { total: 10000,  resetDays: 30 },
  ultra:     { total: 45000,  resetDays: 30 },
  unlimited: { total: 999999, resetDays: 30 },
};

router.get("/credits", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const planInfo = PLAN_CREDITS_MAP[user.plan] || PLAN_CREDITS_MAP.free;
  const used = planInfo.total - user.credits;
  const resetDate = new Date();
  resetDate.setDate(resetDate.getDate() + planInfo.resetDays);

  res.json({
    total: planInfo.total,
    used: Math.max(0, used),
    remaining: user.credits,
    plan: user.plan,
    resetDate: resetDate.toISOString(),
  });
});

router.get("/credits/history", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const transactions = await db
    .select()
    .from(creditTransactionsTable)
    .where(eq(creditTransactionsTable.userId, userId))
    .orderBy(desc(creditTransactionsTable.createdAt))
    .limit(50);

  res.json(transactions.map(t => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    createdAt: t.createdAt,
  })));
});

export default router;
