import { Router, type IRouter } from "express";
import { db, usersTable, referralsTable, tokenTransactionsTable, withdrawalRequestsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const USD_PER_TOKEN = 0.03;
const MIN_WITHDRAWAL_TOKENS = 34;
const TOKEN_REWARDS: Record<string, number> = { basic: 5, pro: 7 };

function generateReferralCode(username: string, userId: number): string {
  const base = username.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4) || "BF";
  return `${base}${userId.toString().padStart(4, "0")}`;
}

export { generateReferralCode, TOKEN_REWARDS };

router.get("/referral/info", requireAuth as any, async (req: any, res): Promise<void> => {
  const userId = req.userId as number;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const referralCode = user.referralCode || generateReferralCode(user.username, user.id);
  if (!user.referralCode) {
    await db.update(usersTable).set({ referralCode }).where(eq(usersTable.id, userId));
  }

  let baseUrl = process.env.APP_URL;
  if (!baseUrl) {
    const replitDomains = process.env.REPLIT_DOMAINS || "";
    const firstDomain = replitDomains.split(",").map(d => d.trim()).find(d => d.length > 0);
    baseUrl = firstDomain ? `https://${firstDomain}` : (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "");
  }
  const referralLink = baseUrl ? `${baseUrl}/register?ref=${referralCode}` : `/register?ref=${referralCode}`;

  const allReferrals = await db
    .select({
      id: referralsTable.id,
      status: referralsTable.status,
      planPurchased: referralsTable.planPurchased,
      tokensAwarded: referralsTable.tokensAwarded,
      rewarded: referralsTable.rewarded,
      createdAt: referralsTable.createdAt,
      rewardedAt: referralsTable.rewardedAt,
      username: usersTable.username,
      email: usersTable.email,
    })
    .from(referralsTable)
    .leftJoin(usersTable, eq(referralsTable.referredUserId, usersTable.id))
    .where(eq(referralsTable.referrerId, userId))
    .orderBy(desc(referralsTable.createdAt));

  const totalReferrals = allReferrals.length;
  const purchasedReferrals = allReferrals.filter(r => r.status === "purchased").length;
  const tokens = user.tokens || 0;
  const usdEarnings = (tokens * USD_PER_TOKEN).toFixed(2);

  res.json({
    referralCode,
    referralLink,
    tokens,
    usdEarnings,
    totalReferrals,
    purchasedReferrals,
    referrals: allReferrals,
    minWithdrawalTokens: MIN_WITHDRAWAL_TOKENS,
    minWithdrawalUsd: (MIN_WITHDRAWAL_TOKENS * USD_PER_TOKEN).toFixed(2),
    tokenRate: `1 token = $${USD_PER_TOKEN.toFixed(2)}`,
  });
});

router.get("/wallet", requireAuth as any, async (req: any, res): Promise<void> => {
  const userId = req.userId as number;
  const [user] = await db.select({ tokens: usersTable.tokens }).from(usersTable).where(eq(usersTable.id, userId));
  const transactions = await db
    .select().from(tokenTransactionsTable)
    .where(eq(tokenTransactionsTable.userId, userId))
    .orderBy(desc(tokenTransactionsTable.createdAt))
    .limit(20);
  res.json({
    tokens: user?.tokens || 0,
    usdValue: ((user?.tokens || 0) * USD_PER_TOKEN).toFixed(2),
    transactions,
  });
});

router.post("/withdraw", requireAuth as any, async (req: any, res): Promise<void> => {
  const userId = req.userId as number;
  const { tokenAmount, method, accountDetails } = req.body || {};

  if (!tokenAmount || !method || !accountDetails) {
    res.status(400).json({ error: "tokenAmount, method, and accountDetails are required" });
    return;
  }
  const tokens = Number(tokenAmount);
  if (isNaN(tokens) || tokens < MIN_WITHDRAWAL_TOKENS) {
    res.status(400).json({ error: `Minimum withdrawal is ${MIN_WITHDRAWAL_TOKENS} tokens ($${(MIN_WITHDRAWAL_TOKENS * USD_PER_TOKEN).toFixed(2)})` });
    return;
  }

  const validMethods = ["binance", "easypaisa", "bank_transfer"];
  if (!validMethods.includes(method)) {
    res.status(400).json({ error: "Invalid payment method" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || (user.tokens || 0) < tokens) {
    res.status(400).json({ error: "Insufficient tokens" });
    return;
  }

  const usdAmount = (tokens * USD_PER_TOKEN).toFixed(2);

  await db.update(usersTable).set({ tokens: (user.tokens || 0) - tokens }).where(eq(usersTable.id, userId));

  const [withdrawal] = await db.insert(withdrawalRequestsTable).values({
    userId,
    tokenAmount: tokens,
    usdAmount,
    method: method as any,
    accountDetails,
    status: "pending",
  }).returning();

  await db.insert(tokenTransactionsTable).values({
    userId,
    type: "withdrawal",
    amount: -tokens,
    reason: `Withdrawal request #${withdrawal.id} — $${usdAmount} via ${method}`,
  });

  res.status(201).json({ withdrawal, message: "Withdrawal request submitted successfully" });
});

router.get("/withdraw/history", requireAuth as any, async (req: any, res): Promise<void> => {
  const userId = req.userId as number;
  const history = await db
    .select().from(withdrawalRequestsTable)
    .where(eq(withdrawalRequestsTable.userId, userId))
    .orderBy(desc(withdrawalRequestsTable.createdAt));
  res.json({ withdrawals: history });
});

export default router;
