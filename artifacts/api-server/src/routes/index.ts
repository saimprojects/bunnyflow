import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import creditsRouter from "./credits";
import generationsRouter from "./generations";
import plansRouter from "./plans";
import extensionRouter from "./extension";
import adminRouter from "./admin";
import downloadsRouter from "./downloads";
import referralRouter from "./referral";
import geminiRouter from "./gemini";
import geminiExtensionRouter from "./geminiExtension";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(creditsRouter);
router.use(generationsRouter);
router.use(plansRouter);
router.use(extensionRouter);
router.use(adminRouter);
router.use(geminiRouter);
router.use("/downloads", downloadsRouter);
router.use(referralRouter);
router.use("/extension", geminiExtensionRouter);

export default router;
