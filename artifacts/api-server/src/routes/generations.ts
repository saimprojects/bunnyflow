import { Router, type IRouter } from "express";
import { eq, desc, and, count } from "drizzle-orm";
import { db, usersTable, generationsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();


const SAMPLE_IMAGES = [
  "https://picsum.photos/seed/flow1/1280/720",
  "https://picsum.photos/seed/flow2/1280/720",
  "https://picsum.photos/seed/flow3/1280/720",
  "https://picsum.photos/seed/flow4/720/1280",
  "https://picsum.photos/seed/flow5/1280/1280",
  "https://picsum.photos/seed/flow6/1280/720",
];

const SAMPLE_THUMBS = [
  "https://picsum.photos/seed/flow1/400/225",
  "https://picsum.photos/seed/flow2/400/225",
  "https://picsum.photos/seed/flow3/400/225",
  "https://picsum.photos/seed/flow4/225/400",
  "https://picsum.photos/seed/flow5/400/400",
  "https://picsum.photos/seed/flow6/400/225",
];

router.get("/generations/stats", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const allGenerations = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.userId, userId))
    .orderBy(desc(generationsTable.createdAt));

  const totalGenerations = allGenerations.length;
  const videosGenerated = allGenerations.filter(g => g.type === "video").length;
  const imagesGenerated = allGenerations.filter(g => g.type === "image").length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const creditsUsedThisMonth = allGenerations
    .filter(g => new Date(g.createdAt) >= monthStart)
    .reduce((sum, g) => sum + g.creditsUsed, 0);

  const recentGenerations = allGenerations.slice(0, 6).map(g => ({
    id: g.id,
    type: g.type,
    model: g.model,
    prompt: g.prompt,
    status: g.status,
    resultUrl: g.resultUrl,
    thumbnailUrl: g.thumbnailUrl,
    creditsUsed: g.creditsUsed,
    aspectRatio: g.aspectRatio,
    duration: g.duration,
    createdAt: g.createdAt,
    completedAt: g.completedAt,
  }));

  const modelCounts: Record<string, number> = {};
  for (const g of allGenerations) {
    modelCounts[g.model] = (modelCounts[g.model] || 0) + 1;
  }
  const modelBreakdown = Object.entries(modelCounts).map(([model, cnt]) => ({ model, count: cnt }));

  res.json({
    totalGenerations,
    videosGenerated,
    imagesGenerated,
    creditsUsedThisMonth,
    recentGenerations,
    modelBreakdown,
  });
});

router.get("/generations", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const type = (req.query.type as string) || "all";
  const limit = parseInt((req.query.limit as string) || "20", 10);
  const offset = parseInt((req.query.offset as string) || "0", 10);

  const whereConditions = [eq(generationsTable.userId, userId)];
  if (type && type !== "all") {
    whereConditions.push(eq(generationsTable.type, type as "video" | "image"));
  }

  const items = await db
    .select()
    .from(generationsTable)
    .where(and(...whereConditions))
    .orderBy(desc(generationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(generationsTable)
    .where(and(...whereConditions));

  res.json({
    items: items.map(g => ({
      id: g.id,
      type: g.type,
      model: g.model,
      prompt: g.prompt,
      status: g.status,
      resultUrl: g.resultUrl,
      thumbnailUrl: g.thumbnailUrl,
      creditsUsed: g.creditsUsed,
      aspectRatio: g.aspectRatio,
      duration: g.duration,
      createdAt: g.createdAt,
      completedAt: g.completedAt,
    })),
    total: Number(total),
    limit,
    offset,
  });
});

router.post("/generations", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const { type, model, prompt, aspectRatio = "landscape", duration } = req.body || {};

  if (!type || !model || !prompt) {
    res.status(400).json({ error: "Validation error", message: "type, model, and prompt are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  // Plan-based access check (no credits deducted)
  const planActive = user.planExpiresAt && new Date(user.planExpiresAt).getTime() > Date.now();
  if (!planActive) {
    const days = user.planExpiresAt
      ? Math.max(0, Math.ceil((new Date(user.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;
    res.status(402).json({
      error: "Plan expired",
      message: days === 0 ? "Your plan has expired. Please contact admin to renew." : `Plan expires in ${days} day(s)`,
      daysRemaining: days,
    });
    return;
  }

  const isImage = type === "image";
  const idx = Math.floor(Math.random() * SAMPLE_IMAGES.length);
  const resultUrl = isImage ? SAMPLE_IMAGES[idx] : null;
  const thumbnailUrl = isImage ? SAMPLE_THUMBS[idx] : null;
  const completedAt = new Date();

  const [generation] = await db.insert(generationsTable).values({
    userId,
    type,
    model,
    prompt,
    status: "completed",
    resultUrl,
    thumbnailUrl,
    creditsUsed: 0,
    aspectRatio: aspectRatio as "landscape" | "portrait" | "square",
    duration: type === "video" ? (duration || 4) : null,
    completedAt,
  }).returning();

  await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, userId));

  res.status(201).json({
    id: generation.id,
    type: generation.type,
    model: generation.model,
    prompt: generation.prompt,
    status: generation.status,
    resultUrl: generation.resultUrl,
    thumbnailUrl: generation.thumbnailUrl,
    creditsUsed: generation.creditsUsed,
    aspectRatio: generation.aspectRatio,
    duration: generation.duration,
    createdAt: generation.createdAt,
    completedAt: generation.completedAt,
  });
});

router.get("/generations/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [generation] = await db
    .select()
    .from(generationsTable)
    .where(and(eq(generationsTable.id, id), eq(generationsTable.userId, userId)));

  if (!generation) {
    res.status(404).json({ error: "Generation not found" });
    return;
  }

  res.json({
    id: generation.id,
    type: generation.type,
    model: generation.model,
    prompt: generation.prompt,
    status: generation.status,
    resultUrl: generation.resultUrl,
    thumbnailUrl: generation.thumbnailUrl,
    creditsUsed: generation.creditsUsed,
    aspectRatio: generation.aspectRatio,
    duration: generation.duration,
    createdAt: generation.createdAt,
    completedAt: generation.completedAt,
  });
});

export default router;
