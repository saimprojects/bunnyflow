import { Router, type IRouter, type Request, type Response } from "express";
import { db, flowSessionsTable, geminiSessionsTable, whiskSessionsTable, usersTable, generationsTable, adminSettingsTable, referralsTable, tokenTransactionsTable, withdrawalRequestsTable } from "@workspace/db";
import { eq, desc, count, sql, and } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

const TOKEN_REWARDS: Record<string, number> = { basic: 5, pro: 7 };

const PLAN_DAYS: Record<string, number> = { free: 1, basic: 15, pro: 30 };

const router: IRouter = Router();

const ADMIN_KEY = "flow-admin-2024";
const FLOW_COOKIE_KEY = "FlowCookieEncKey2024!@#SecureX99";

// const ADMIN_EMAIL = "admin@bunnyflow.app";
// const ADMIN_PASS_SALT = "BunnyFlowAdminSalt2024XZ";
// const ADMIN_PASS_HASH = "c99f76e91efbe6e235721b0f0ecec16281be1718302b0d4b0ae4078f26dc2666704ef87576fb00af3ad2b2b8411d57185e3a8a54587d91afd77663a2819818dc";
const ADMIN_EMAIL = "admin@bunnyflow.app";
const ADMIN_PASS_SALT = "BunnyFlowAdminSalt2024XZ";
const ADMIN_PASS_HASH = "c99f76e91efbe6e235721b0f0ecec16281be1718302b0d4b0ae4078f26dc2666704ef87576fb00af3ad2b2b8411d57185e3a8a54587d91afd77663a2819818dc";
function requireAdmin(req: Request, res: Response, next: () => void): void {
  const key = req.headers["x-admin-key"] || req.body?.adminKey || req.query?.adminKey;
  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function encryptCookiesForUser(cookies: object[], userId: number): string {
  const keyDigest = crypto.createHash("sha256").update(FLOW_COOKIE_KEY).digest();
  const iv = crypto.randomBytes(12);
  const data = {
    u: userId,
    e: Date.now() + 7 * 24 * 3600 * 1000,
    c: cookies,
  };
  const plaintext = JSON.stringify(data);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyDigest, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${ciphertext.toString("hex")}`;
}

// router.post("/admin/login", async (req, res): Promise<void> => {
//   const { email, password } = req.body || {};
//   if (!email || !password) {
//     res.status(400).json({ error: "Email and password required" });
//     return;
//   }
//   if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
//     res.status(401).json({ error: "Invalid credentials" });
//     return;
//   }
//   const attempt = crypto.pbkdf2Sync(password, ADMIN_PASS_SALT, 100000, 64, "sha512").toString("hex");
//   if (attempt !== ADMIN_PASS_HASH) {
//     res.status(401).json({ error: "Invalid credentials" });
//     return;
//   }
//   res.json({ token: ADMIN_KEY, email: ADMIN_EMAIL });
// });

router.post("/admin/login", async (req, res): Promise<void> => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  if (email.toLowerCase() !== "admin@bunnyflow.app") {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (password !== "admin123") {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({ token: ADMIN_KEY, email: "admin@bunnyflow.app" });
});
router.get("/admin/verify-key", requireAdmin as any, (_req, res): void => {
  res.json({ valid: true });
});

router.get("/admin/sessions", requireAdmin as any, async (_req, res): Promise<void> => {
  const sessions = await db.select({
    id: flowSessionsTable.id,
    label: flowSessionsTable.label,
    isActive: flowSessionsTable.isActive,
    expiresAt: flowSessionsTable.expiresAt,
    createdAt: flowSessionsTable.createdAt,
  }).from(flowSessionsTable).orderBy(desc(flowSessionsTable.createdAt));
  res.json({ sessions });
});

router.post("/admin/sessions", requireAdmin as any, async (req, res): Promise<void> => {
  const { label, cookiesJson } = req.body || {};
  if (!label || !cookiesJson) {
    res.status(400).json({ error: "label and cookiesJson are required" });
    return;
  }
  try {
    JSON.parse(cookiesJson);
  } catch {
    res.status(400).json({ error: "cookiesJson must be valid JSON" });
    return;
  }
  const [session] = await db.insert(flowSessionsTable)
    .values({ label, cookiesJson, isActive: true })
    .returning();
  res.json({ session });
});

router.patch("/admin/sessions/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { isActive, label } = req.body || {};
  const updates: Partial<{ isActive: boolean; label: string }> = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (label !== undefined) updates.label = label;
  await db.update(flowSessionsTable).set(updates).where(eq(flowSessionsTable.id, id));
  res.json({ ok: true });
});

router.delete("/admin/sessions/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(flowSessionsTable).where(eq(flowSessionsTable.id, id));
  res.json({ ok: true });
});

router.get("/admin/users", requireAdmin as any, async (_req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    username: usersTable.username,
    plan: usersTable.plan,
    credits: usersTable.credits,
    creditsTotal: usersTable.creditsTotal,
    createdAt: usersTable.createdAt,
    lastActiveAt: usersTable.lastActiveAt,
    planExpiresAt: usersTable.planExpiresAt,
    planStartDate: usersTable.planStartDate,
    referredBy: usersTable.referredBy,
  }).from(usersTable).orderBy(desc(usersTable.createdAt));

  const genCounts = await db
    .select({ userId: generationsTable.userId, total: count(), type: generationsTable.type })
    .from(generationsTable)
    .groupBy(generationsTable.userId, generationsTable.type);

  const countMap: Record<number, { total: number; videos: number; images: number }> = {};
  for (const g of genCounts) {
    if (!countMap[g.userId]) countMap[g.userId] = { total: 0, videos: 0, images: 0 };
    countMap[g.userId].total += Number(g.total);
    if (g.type === "video") countMap[g.userId].videos += Number(g.total);
    else countMap[g.userId].images += Number(g.total);
  }

  const result = users.map(u => {
    const days = u.planExpiresAt ? Math.max(0, Math.ceil((new Date(u.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
    return {
      ...u,
      creditsTotal: days,
      credits: days,
      daysRemaining: days,
      generationCount: countMap[u.id]?.total || 0,
      videosCount: countMap[u.id]?.videos || 0,
      imagesCount: countMap[u.id]?.images || 0,
    };
  });

  res.json({ users: result });
});

router.patch("/admin/users/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { credits, plan, username, creditsTotal, planExpiresAt } = req.body || {};
  const updates: Record<string, unknown> = {};
  const planChanged = plan !== undefined;
  if (credits !== undefined) updates.credits = Number(credits);
  if (planChanged) {
    updates.plan = plan;
    const now = new Date();
    updates.planStartDate = now;
    // only set default expiry if no custom date provided
    if (planExpiresAt === undefined) {
      const days = PLAN_DAYS[plan as string] ?? 30;
      updates.planExpiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }
  }
  if (planExpiresAt !== undefined) {
    updates.planExpiresAt = new Date(planExpiresAt);
  }
  if (username !== undefined) updates.username = username;
  if (creditsTotal !== undefined) updates.creditsTotal = Number(creditsTotal);
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }
  const [user] = await db.update(usersTable).set(updates as any).where(eq(usersTable.id, id)).returning();

  // Award referral tokens if plan was changed to a paid plan
  if (planChanged) {
    const tokenReward = TOKEN_REWARDS[plan as string];
    if (tokenReward && user.referredBy) {
      const existingRewarded = await db.select().from(referralsTable)
        .where(and(eq(referralsTable.referredUserId, id), eq(referralsTable.rewarded, true)));
      if (existingRewarded.length === 0) {
        const [referrer] = await db.select().from(usersTable).where(eq(usersTable.id, user.referredBy));
        if (referrer) {
          const now = new Date();
          await db.update(usersTable).set({ tokens: (referrer.tokens || 0) + tokenReward }).where(eq(usersTable.id, referrer.id));
          await db.update(referralsTable).set({
            status: "purchased",
            planPurchased: plan,
            tokensAwarded: tokenReward,
            rewarded: true,
            rewardedAt: now,
          }).where(eq(referralsTable.referredUserId, id));
          await db.insert(tokenTransactionsTable).values({
            userId: referrer.id,
            type: "referral_reward",
            amount: tokenReward,
            reason: `Referral reward: ${user.username} purchased ${plan} plan`,
          });
        }
      }
    }
  }

  res.json({ user });
});

router.delete("/admin/users/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

router.post("/admin/users/:id/reset-credits", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { amount } = req.body || {};
  const credits = amount !== undefined ? Number(amount) : 999999;
  const [user] = await db.update(usersTable).set({ credits }).where(eq(usersTable.id, id)).returning();
  res.json({ user });
});

router.post("/admin/users/:id/set-plan", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { plan, resetCredits = false } = req.body || {};
  if (!plan) { res.status(400).json({ error: "plan required" }); return; }

  const days = PLAN_DAYS[plan] ?? 1;
  const now = new Date();
  const planExpiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const updates: Record<string, unknown> = { plan, planStartDate: now, planExpiresAt: planExpiry, credits: 0, creditsTotal: 0 };

  const [user] = await db.update(usersTable).set(updates as any).where(eq(usersTable.id, id)).returning();

  const tokenReward = TOKEN_REWARDS[plan];
  if (tokenReward && user.referredBy) {
    const existingReferral = await db.select().from(referralsTable)
      .where(and(eq(referralsTable.referredUserId, id), eq(referralsTable.rewarded, true)));

    if (existingReferral.length === 0) {
      const [referrer] = await db.select().from(usersTable).where(eq(usersTable.id, user.referredBy));
      if (referrer) {
        const newTokens = (referrer.tokens || 0) + tokenReward;
        await db.update(usersTable).set({ tokens: newTokens }).where(eq(usersTable.id, referrer.id));
        await db.update(referralsTable).set({
          status: "purchased",
          planPurchased: plan,
          tokensAwarded: tokenReward,
          rewarded: true,
          rewardedAt: now,
        }).where(eq(referralsTable.referredUserId, id));
        await db.insert(tokenTransactionsTable).values({
          userId: referrer.id,
          type: "referral_reward",
          amount: tokenReward,
          reason: `Referral reward: ${user.username} purchased ${plan} plan`,
        });
      }
    }
  }

  res.json({ user });
});

router.post("/admin/users/:id/add-credits", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { amount } = req.body || {};
  if (!amount || isNaN(Number(amount))) { res.status(400).json({ error: "amount required" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) { res.status(404).json({ error: "User not found" }); return; }

  const newCredits = existing.credits + Number(amount);
  const [user] = await db.update(usersTable).set({ credits: newCredits }).where(eq(usersTable.id, id)).returning();
  res.json({ user });
});

// Manually fix referral reward for a user who has already been assigned a paid plan
router.post("/admin/users/:id/fix-referral", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.referredBy) { res.status(400).json({ error: "User was not referred by anyone" }); return; }

  const plan = user.plan;
  const tokenReward = TOKEN_REWARDS[plan];
  if (!tokenReward) { res.status(400).json({ error: `No token reward for plan: ${plan}` }); return; }

  const existingRewarded = await db.select().from(referralsTable)
    .where(and(eq(referralsTable.referredUserId, id), eq(referralsTable.rewarded, true)));
  if (existingRewarded.length > 0) {
    res.status(400).json({ error: "Referral reward already given for this user" }); return;
  }

  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.id, user.referredBy));
  if (!referrer) { res.status(404).json({ error: "Referrer not found" }); return; }

  const now = new Date();
  await db.update(usersTable).set({ tokens: (referrer.tokens || 0) + tokenReward }).where(eq(usersTable.id, referrer.id));
  await db.update(referralsTable).set({
    status: "purchased",
    planPurchased: plan,
    tokensAwarded: tokenReward,
    rewarded: true,
    rewardedAt: now,
  }).where(and(eq(referralsTable.referredUserId, id), eq(referralsTable.referrerId, referrer.id)));
  await db.insert(tokenTransactionsTable).values({
    userId: referrer.id,
    type: "referral_reward",
    amount: tokenReward,
    reason: `Manual referral fix: ${user.username} on ${plan} plan`,
  });

  res.json({ ok: true, tokensAwarded: tokenReward, referrer: referrer.username, referredUser: user.username });
});

router.post("/admin/users/create", requireAdmin as any, async (req, res): Promise<void> => {
  const { email, username, password, plan = "free" } = req.body || {};
  if (!email || !username || !password) {
    res.status(400).json({ error: "email, username, password required" });
    return;
  }

  const planDays = PLAN_DAYS[plan] ?? 1;
  const passwordHash = hashPassword(password);
  const now = new Date();
  const planExpiry = new Date(now.getTime() + planDays * 24 * 60 * 60 * 1000);

  try {
    const [user] = await db.insert(usersTable).values({
      email,
      username,
      passwordHash,
      plan: plan as any,
      credits: 0,
      creditsTotal: 0,
      lastActiveAt: now,
      planStartDate: now,
      planExpiresAt: planExpiry,
    }).returning();
    res.status(201).json({ user });
  } catch (e: any) {
    if (e.message?.includes("unique")) {
      res.status(400).json({ error: "Email or username already in use" });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});

router.get("/admin/stats", requireAdmin as any, async (_req, res): Promise<void> => {
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [totalGenerations] = await db.select({ count: count() }).from(generationsTable);
  const [activeSessions] = await db.select({ count: count() })
    .from(flowSessionsTable)
    .where(eq(flowSessionsTable.isActive, true));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [todayGenerations] = await db.select({ count: count() })
    .from(generationsTable)
    .where(sql`${generationsTable.createdAt} >= ${todayStart}`);

  const creditStats = await db.select({
    totalCredits: sql<number>`SUM(credits)`,
    totalCreditsTotal: sql<number>`SUM(credits_total)`,
  }).from(usersTable);

  const totalCreditsRemaining = Number(creditStats[0]?.totalCredits ?? 0);
  const totalCreditsDistributed = Number(creditStats[0]?.totalCreditsTotal ?? 0);
  const avgCredits = Number(totalUsers.count) > 0 ? Math.round(totalCreditsRemaining / Number(totalUsers.count)) : 0;

  const planDist = await db.select({ plan: usersTable.plan, count: count() })
    .from(usersTable)
    .groupBy(usersTable.plan);

  const recentUsers = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
    plan: usersTable.plan,
    credits: usersTable.credits,
    creditsTotal: usersTable.creditsTotal,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(desc(usersTable.createdAt)).limit(5);

  res.json({
    totalUsers: Number(totalUsers.count),
    totalGenerations: Number(totalGenerations.count),
    activeSessions: Number(activeSessions.count),
    todayGenerations: Number(todayGenerations.count),
    totalCreditsRemaining,
    totalCreditsDistributed,
    avgCredits,
    planDistribution: planDist.map(p => ({ plan: p.plan, count: Number(p.count) })),
    recentUsers,
  });
});

const DEFAULT_SETTINGS = {
  allowHighPriorityVideo: false,
  allowLowPriorityVideo: true,
  allowImageGeneration: true,
  allowFreeImagesOnly: true,
  hideProjectHistory: true,
  blockAccountAccess: true,
  forceNewProjectOnly: true,
  restrictedModels: ["veo3", "high_quality", "premium"],
  allowedModels: ["veo2_fast", "imagen_free"],
  maxVideosPerSession: 10,
  maxImagesPerSession: 20,
};

router.get("/admin/settings", requireAdmin as any, async (_req, res): Promise<void> => {
  const rows = await db.select().from(adminSettingsTable);
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    try {
      (settings as any)[row.key] = JSON.parse(row.value);
    } catch {
      (settings as any)[row.key] = row.value;
    }
  }
  res.json({ settings });
});

router.patch("/admin/settings", requireAdmin as any, async (req, res): Promise<void> => {
  const updates = req.body || {};
  for (const [key, value] of Object.entries(updates)) {
    const valueStr = JSON.stringify(value);
    const existing = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, key));
    if (existing.length > 0) {
      await db.update(adminSettingsTable)
        .set({ value: valueStr, updatedAt: new Date() })
        .where(eq(adminSettingsTable.key, key));
    } else {
      await db.insert(adminSettingsTable).values({ key, value: valueStr });
    }
  }
  res.json({ ok: true });
});

router.get("/admin/withdrawals", requireAdmin as any, async (_req, res): Promise<void> => {
  const withdrawals = await db
    .select({
      id: withdrawalRequestsTable.id,
      userId: withdrawalRequestsTable.userId,
      tokenAmount: withdrawalRequestsTable.tokenAmount,
      usdAmount: withdrawalRequestsTable.usdAmount,
      method: withdrawalRequestsTable.method,
      accountDetails: withdrawalRequestsTable.accountDetails,
      status: withdrawalRequestsTable.status,
      adminNote: withdrawalRequestsTable.adminNote,
      createdAt: withdrawalRequestsTable.createdAt,
      processedAt: withdrawalRequestsTable.processedAt,
      username: usersTable.username,
      email: usersTable.email,
    })
    .from(withdrawalRequestsTable)
    .leftJoin(usersTable, eq(withdrawalRequestsTable.userId, usersTable.id))
    .orderBy(desc(withdrawalRequestsTable.createdAt));
  res.json({ withdrawals });
});

router.patch("/admin/withdrawals/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { status, adminNote } = req.body || {};
  const validStatuses = ["pending", "approved", "rejected", "paid"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: "Valid status required: pending | approved | rejected | paid" });
    return;
  }
  const [withdrawal] = await db.select().from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.id, id));
  if (!withdrawal) { res.status(404).json({ error: "Withdrawal not found" }); return; }

  if (status === "rejected" && withdrawal.status === "pending") {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, withdrawal.userId));
    if (user) {
      await db.update(usersTable).set({ tokens: (user.tokens || 0) + withdrawal.tokenAmount }).where(eq(usersTable.id, user.id));
      await db.insert(tokenTransactionsTable).values({
        userId: user.id,
        type: "withdrawal_refund",
        amount: withdrawal.tokenAmount,
        reason: `Withdrawal #${id} rejected — tokens refunded`,
      });
    }
  }

  const [updated] = await db.update(withdrawalRequestsTable).set({
    status: status as any,
    adminNote: adminNote || withdrawal.adminNote,
    processedAt: status !== "pending" ? new Date() : withdrawal.processedAt,
  }).where(eq(withdrawalRequestsTable.id, id)).returning();

  res.json({ withdrawal: updated });
});

// ─── Gemini Sessions ────────────────────────────────────────────────────────

router.get("/admin/gemini-sessions", requireAdmin as any, async (_req, res): Promise<void> => {
  const sessions = await db.select().from(geminiSessionsTable).orderBy(desc(geminiSessionsTable.createdAt));
  const sessionsWithCount = sessions.map(s => {
    let cookieCount = 0;
    try { cookieCount = JSON.parse(s.cookiesJson || "[]").length; } catch { /* empty */ }
    return { ...s, cookieCount };
  });
  res.json({ sessions: sessionsWithCount });
});

router.post("/admin/gemini-sessions", requireAdmin as any, async (req, res): Promise<void> => {
  const { label, cookiesJson, isActive, expiresAt } = req.body || {};
  if (!label || !cookiesJson) { res.status(400).json({ error: "label and cookiesJson required" }); return; }
  try { JSON.parse(cookiesJson); } catch { res.status(400).json({ error: "cookiesJson must be valid JSON" }); return; }
  const [session] = await db.insert(geminiSessionsTable).values({
    label,
    cookiesJson,
    isActive: isActive !== false,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.json({ session });
});

router.patch("/admin/gemini-sessions/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { isActive, label, cookiesJson, expiresAt } = req.body || {};
  const updates: Record<string, unknown> = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (label !== undefined) updates.label = label;
  if (cookiesJson !== undefined) { try { JSON.parse(cookiesJson); updates.cookiesJson = cookiesJson; } catch { res.status(400).json({ error: "Invalid JSON" }); return; } }
  if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
  await db.update(geminiSessionsTable).set(updates).where(eq(geminiSessionsTable.id, id));
  res.json({ ok: true });
});

router.delete("/admin/gemini-sessions/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(geminiSessionsTable).where(eq(geminiSessionsTable.id, id));
  res.json({ ok: true });
});

// ─── Whisk Sessions ──────────────────────────────────────────────────────────

router.get("/admin/whisk-sessions", requireAdmin as any, async (_req, res): Promise<void> => {
  const sessions = await db.select().from(whiskSessionsTable).orderBy(desc(whiskSessionsTable.createdAt));
  const sessionsWithCount = sessions.map(s => {
    let cookieCount = 0;
    try { cookieCount = JSON.parse(s.cookiesJson || "[]").length; } catch { /* empty */ }
    return { ...s, cookieCount };
  });
  res.json({ sessions: sessionsWithCount });
});

router.post("/admin/whisk-sessions", requireAdmin as any, async (req, res): Promise<void> => {
  const { label, cookiesJson, isActive, expiresAt } = req.body || {};
  if (!label || !cookiesJson) { res.status(400).json({ error: "label and cookiesJson required" }); return; }
  try { JSON.parse(cookiesJson); } catch { res.status(400).json({ error: "cookiesJson must be valid JSON" }); return; }
  const [session] = await db.insert(whiskSessionsTable).values({
    label,
    cookiesJson,
    isActive: isActive !== false,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.json({ session });
});

router.patch("/admin/whisk-sessions/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { isActive, label, cookiesJson, expiresAt } = req.body || {};
  const updates: Record<string, unknown> = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (label !== undefined) updates.label = label;
  if (cookiesJson !== undefined) { try { JSON.parse(cookiesJson); updates.cookiesJson = cookiesJson; } catch { res.status(400).json({ error: "Invalid JSON" }); return; } }
  if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
  await db.update(whiskSessionsTable).set(updates).where(eq(whiskSessionsTable.id, id));
  res.json({ ok: true });
});

router.delete("/admin/whisk-sessions/:id", requireAdmin as any, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(whiskSessionsTable).where(eq(whiskSessionsTable.id, id));
  res.json({ ok: true });
});

// ─── Referrals ───────────────────────────────────────────────────────────────

router.get("/admin/referrals", requireAdmin as any, async (_req, res): Promise<void> => {
  const referrals = await db
    .select({
      id: referralsTable.id,
      status: referralsTable.status,
      planPurchased: referralsTable.planPurchased,
      tokensAwarded: referralsTable.tokensAwarded,
      rewarded: referralsTable.rewarded,
      createdAt: referralsTable.createdAt,
      rewardedAt: referralsTable.rewardedAt,
      referrerId: referralsTable.referrerId,
    })
    .from(referralsTable)
    .orderBy(desc(referralsTable.createdAt));
  const [totals] = await db.select({ totalTokens: sql<number>`SUM(tokens)` }).from(usersTable);
  res.json({ referrals, totalTokensIssued: Number(totals?.totalTokens || 0) });
});

// ── CUSTOM EXTENSION UPLOAD ───────────────────────────────────────────────
const UPLOAD_DIR  = path.join(process.cwd(), "uploads");
const EXT_FILE    = path.join(UPLOAD_DIR, "custom-extension.zip");
const META_FILE   = path.join(UPLOAD_DIR, "extension-meta.json");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => { ensureUploadDir(); cb(null, UPLOAD_DIR); },
    filename:    (_req, _file, cb) => cb(null, "custom-extension.zip"),
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files allowed"));
    }
  },
});

router.post("/extension-upload", requireAdmin, upload.single("extension"), (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const meta = {
    filename: req.file.originalname,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  };
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  res.json({ ok: true, meta });
});

router.get("/extension-meta", requireAdmin, (_req, res) => {
  if (!fs.existsSync(META_FILE)) { res.json({ uploaded: false }); return; }
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, "utf8"));
    res.json({ uploaded: true, ...meta });
  } catch { res.json({ uploaded: false }); }
});

export default router;
