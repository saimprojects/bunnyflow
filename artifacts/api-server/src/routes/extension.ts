import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, flowSessionsTable, adminSettingsTable, generationsTable } from "@workspace/db";
import { requireAuth, verifyToken } from "../lib/auth";
import { encryptCookiesForUser } from "./admin";

const router: IRouter = Router();

const DEFAULT_FEATURE_SETTINGS = {
  allowHighPriorityVideo: false,
  allowLowPriorityVideo: true,
  allowImageGeneration: true,
  allowFreeImagesOnly: true,
  hideProjectHistory: true,
  blockAccountAccess: true,
  forceNewProjectOnly: true,
  maxVideosPerSession: 10,
  maxImagesPerSession: 20,
};

async function getFeatureSettings(): Promise<typeof DEFAULT_FEATURE_SETTINGS> {
  try {
    const rows = await db.select().from(adminSettingsTable);
    const settings = { ...DEFAULT_FEATURE_SETTINGS };
    for (const row of rows) {
      try { (settings as any)[row.key] = JSON.parse(row.value); } catch { (settings as any)[row.key] = row.value; }
    }
    return settings;
  } catch {
    return DEFAULT_FEATURE_SETTINGS;
  }
}

function daysRemaining(expiresAt: Date | null | undefined): number {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function isPlanActive(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

function buildUserInfo(user: typeof usersTable.$inferSelect) {
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
    planExpiresAt: user.planExpiresAt,
  };
}

router.get("/extension/cookie-version", (_req, res): void => {
  res.json({ version: "1.0.0", ok: true });
});

router.post("/extension/cookie-version", (_req, res): void => {
  res.json({ version: "1.0.0", ok: true });
});

router.get("/user/cookies", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const featureSettings = await getFeatureSettings();
  const userInfo = buildUserInfo(user);

  if ((user.plan || "free").toLowerCase() === "free") {
    res.json({
      ok: false,
      error: "free_plan_no_access",
      message: "Google Flow access requires a Basic or Pro plan.",
      cookieCount: 0,
      cookieSystemDisabled: false,
      user: userInfo,
      featureSettings,
    });
    return;
  }

  if (!isPlanActive(user.planExpiresAt)) {
    res.json({
      ok: false,
      error: "plan_expired",
      cookieCount: 0,
      cookieSystemDisabled: false,
      user: userInfo,
      featureSettings,
    });
    return;
  }

  const activeSessions = await db.select()
    .from(flowSessionsTable)
    .where(eq(flowSessionsTable.isActive, true))
    .orderBy(flowSessionsTable.createdAt)
    .limit(1);

  if (activeSessions.length === 0) {
    res.json({
      ok: true,
      cookieCount: 0,
      cookieSystemDisabled: true,
      user: userInfo,
      featureSettings,
    });
    return;
  }

  const session = activeSessions[0];
  let cookies: object[] = [];
  try { cookies = JSON.parse(session.cookiesJson); } catch { /* empty */ }

  const encryptedCookies = encryptCookiesForUser(cookies, userId);

  res.json({
    ok: true,
    cookieCount: cookies.length,
    encryptedCookies,
    user: userInfo,
    featureSettings,
  });
});

router.post("/extension/verify", async (req, res): Promise<void> => {
  const { token, userId, sessionToken } = req.body || {};

  let resolvedUserId: number | null = null;

  try {
    if (token) {
      const payload = verifyToken(token);
      resolvedUserId = payload?.userId ?? null;
    } else if (sessionToken) {
      const parts = String(sessionToken).split(":");
      const rawToken = parts.slice(1).join(":");
      if (rawToken && rawToken !== "undefined") {
        const payload = verifyToken(rawToken);
        resolvedUserId = payload?.userId ?? null;
      }
    }

    if (!resolvedUserId && userId) {
      resolvedUserId = Number(userId);
    }

    if (!resolvedUserId) {
      res.status(401).json({ valid: false, error: "Invalid token" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, resolvedUserId));
    if (!user) {
      res.status(401).json({ valid: false, error: "User not found" });
      return;
    }

    await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, resolvedUserId));

    const featureSettings = await getFeatureSettings();
    const userInfo = buildUserInfo(user);

    if ((user.plan || "free").toLowerCase() === "free") {
      res.json({ valid: false, error: "free_plan_no_access", message: "Google Flow access requires a Basic or Pro plan.", user: userInfo, featureSettings });
      return;
    }

    if (!isPlanActive(user.planExpiresAt)) {
      res.json({ valid: false, error: "plan_expired", user: userInfo, featureSettings });
      return;
    }

    const activeSessions = await db.select()
      .from(flowSessionsTable)
      .where(eq(flowSessionsTable.isActive, true))
      .orderBy(flowSessionsTable.createdAt)
      .limit(1);

    if (activeSessions.length === 0) {
      res.json({ valid: true, cookieSystemDisabled: true, user: userInfo, featureSettings });
      return;
    }

    const session = activeSessions[0];
    let cookies: object[] = [];
    try {
      cookies = JSON.parse(session.cookiesJson);
    } catch {
      res.json({ valid: true, cookieSystemDisabled: true, user: userInfo, featureSettings });
      return;
    }

    const encryptedCookies = encryptCookiesForUser(cookies, resolvedUserId);
    res.json({ valid: true, encryptedCookies, user: userInfo, featureSettings });
  } catch {
    res.status(401).json({ valid: false, error: "Token verification failed" });
  }
});

function requireExtAuth(req: Parameters<typeof requireAuth>[0], res: Parameters<typeof requireAuth>[1], next: Parameters<typeof requireAuth>[2]): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return requireAuth(req, res, next);
  }

  const { userId: bodyUserId, sessionToken } = (req.body || {}) as { userId?: unknown; sessionToken?: string };

  if (bodyUserId && sessionToken && typeof sessionToken === "string") {
    let jwt = sessionToken;
    if (sessionToken.includes(":")) {
      const colonIdx = sessionToken.indexOf(":");
      jwt = sessionToken.substring(colonIdx + 1);
    }

    if (jwt && jwt.length > 20) {
      try {
        const payload = verifyToken(jwt);
        if (payload) {
          (req as typeof req & { userId: number }).userId = payload.userId;
          return next();
        }
      } catch {}
    }
  }

  res.status(401).json({ error: "Unauthorized" });
}

router.post("/extension/use-credits", requireExtAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;
  const { type = "image", mediaType, prompt = "" } = req.body || {};
  const effectiveType = (mediaType || type) as string;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if ((user.plan || "free").toLowerCase() === "free") {
    res.status(403).json({
      error: "free_plan_no_access",
      message: "Google Flow access requires a Basic or Pro plan.",
      creditsLeft: 0,
      creditsRemaining: 0,
    });
    return;
  }

  if (!isPlanActive(user.planExpiresAt)) {
    res.status(402).json({
      error: "plan_expired",
      message: "Your plan has expired. Please renew to continue.",
      creditsLeft: 0,
      creditsRemaining: 0,
    });
    return;
  }

  await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, userId));

  try {
    await db.insert(generationsTable).values({
      userId,
      prompt: String(prompt).substring(0, 500),
      type: effectiveType,
      status: "completed",
    });
  } catch {}

  const days = daysRemaining(user.planExpiresAt);
  res.json({
    success: true,
    creditsUsed: 0,
    creditsRemaining: days,
    creditsLeft: days,
  });
});

router.post("/extension/generate", requireExtAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;
  const { prompt = "", mediaType, type, model = "veo" } = req.body || {};
  const effectiveType = (mediaType || type || "video") as string;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if ((user.plan || "free").toLowerCase() === "free") {
    res.status(403).json({
      error: "free_plan_no_access",
      message: "Google Flow access requires a Basic or Pro plan.",
      creditsLeft: 0,
    });
    return;
  }

  if (!isPlanActive(user.planExpiresAt)) {
    res.status(402).json({
      error: "plan_expired",
      message: "Your plan has expired. Please renew to continue.",
      creditsLeft: 0,
    });
    return;
  }

  await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, userId));

  try {
    await db.insert(generationsTable).values({
      userId,
      prompt: String(prompt).substring(0, 500),
      type: effectiveType,
      status: "completed",
    });
  } catch {}

  const days = daysRemaining(user.planExpiresAt);
  res.json({
    ok: true,
    type: effectiveType,
    model,
    prompt,
    creditsUsed: 0,
    creditsRemaining: days,
    creditsLeft: days,
  });
});

export default router;
