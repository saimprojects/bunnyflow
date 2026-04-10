import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, referralsTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword, signToken, requireAuth } from "../lib/auth";

const PLAN_DAYS: Record<string, number> = {
  free: 1,
  basic: 15,
  pro: 30,
};

const router: IRouter = Router();

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5 Pakistan Standard Time

function daysRemaining(expiresAt: Date | null | undefined): number | null {
  if (!expiresAt) return null;
  const nowMs  = Date.now();
  const expMs  = new Date(expiresAt).getTime();
  // Count whole calendar days in PKT timezone (midnight PKT = 19:00 UTC)
  const nowDayPKT = Math.floor((nowMs + PKT_OFFSET_MS) / 86_400_000);
  const expDayPKT = Math.floor((expMs + PKT_OFFSET_MS) / 86_400_000);
  return Math.max(0, expDayPKT - nowDayPKT);
}

function generateReferralCode(username: string, userId: number): string {
  const base = username.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4) || "BF";
  return `${base}${userId.toString().padStart(4, "0")}`;
}

function formatUser(user: typeof usersTable.$inferSelect) {
  const days = daysRemaining(user.planExpiresAt);
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    plan: user.plan,
    credits: days,
    creditsTotal: days,
    creditsLeft: days,
    daysRemaining: days,
    createdAt: user.createdAt,
    planStartDate: user.planStartDate,
    planExpiresAt: user.planExpiresAt,
    planActive: user.planExpiresAt ? new Date(user.planExpiresAt).getTime() > Date.now() : false,
    referralCode: user.referralCode,
    tokens: user.tokens ?? 0,
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { email, password, username } = parsed.data;
  const refCode = (req.body.referralCode || req.query.ref || "") as string;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already in use", message: "An account with this email already exists" });
    return;
  }

  let referrerId: number | null = null;
  if (refCode) {
    const [referrer] = await db.select({ id: usersTable.id }).from(usersTable)
      .where(eq(usersTable.referralCode, refCode.toUpperCase()));
    if (referrer) referrerId = referrer.id;
  }

  const passwordHash = hashPassword(password);
  const now = new Date();
  const trialDays = PLAN_DAYS["free"] ?? 1;
  const planExpiry = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const [user] = await db.insert(usersTable).values({
    email,
    username,
    passwordHash,
    plan: "free",
    credits: 0,
    creditsTotal: 0,
    lastActiveAt: now,
    planStartDate: now,
    planExpiresAt: planExpiry,
    referredBy: referrerId ?? undefined,
    tokens: 0,
  }).returning();

  const referralCode = generateReferralCode(user.username, user.id);
  await db.update(usersTable).set({ referralCode }).where(eq(usersTable.id, user.id));

  if (referrerId) {
    await db.insert(referralsTable).values({
      referrerId,
      referredUserId: user.id,
      status: "pending",
    });
  }

  const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));

  const token = signToken(user.id);
  res.status(201).json({ user: formatUser(updatedUser), token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials", message: "Email or password is incorrect" });
    return;
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials", message: "Email or password is incorrect" });
    return;
  }

  await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, user.id));

  const token = signToken(user.id);
  res.json({ user: formatUser(user), token });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, userId));
  res.json(formatUser(user));
});

router.get("/user/credits", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const days = daysRemaining(user.planExpiresAt);
  const planDays = PLAN_DAYS[user.plan] ?? 1;

  res.json({
    credits: days,
    creditsLeft: days,
    daysRemaining: days,
    plan: user.plan,
    planDays,
    planActive: user.planExpiresAt ? new Date(user.planExpiresAt).getTime() > Date.now() : false,
    planStartDate: user.planStartDate,
    planExpiresAt: user.planExpiresAt,
  });
});

router.patch("/auth/update-profile", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;
  const { email, currentPassword, newPassword } = req.body;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (newPassword) {
    if (!currentPassword) { res.status(400).json({ error: "Current password required to set a new password" }); return; }
    const valid = verifyPassword(currentPassword, user.passwordHash);
    if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }
    updates.passwordHash = hashPassword(newPassword);
  }

  if (email && email !== user.email) {
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
    if (existing) { res.status(400).json({ error: "Email already in use by another account" }); return; }
    updates.email = email;
  }

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nothing to update" }); return; }

  await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));
  const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.json({ user: formatUser(updated), message: "Profile updated successfully" });
});

router.get("/auto-signout", (req, res) => {
  res.json({ ok: true });
});

export default router;
