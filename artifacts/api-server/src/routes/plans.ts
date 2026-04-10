import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 500,
    features: [
      "500 credits per month",
      "Image generation (Nano Banana)",
      "720p output quality",
      "Community support",
    ],
    popular: false,
    color: "gray",
  },
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    credits: 5000,
    features: [
      "5,000 credits per month",
      "Image generation (Imagen 4)",
      "Video generation (Veo 3)",
      "1080p output quality",
      "Email support",
    ],
    popular: false,
    color: "blue",
  },
  {
    id: "starter",
    name: "Starter",
    price: 19.99,
    credits: 25000,
    features: [
      "25,000 credits per month",
      "All image models",
      "Video generation (Veo 3)",
      "1080p output quality",
      "Chrome extension access",
      "Priority support",
    ],
    popular: false,
    color: "green",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29.99,
    credits: 10000,
    features: [
      "10,000 credits per month",
      "All AI models",
      "4K output quality",
      "Priority generation queue",
      "Chrome extension access",
      "Priority support",
    ],
    popular: true,
    color: "purple",
  },
  {
    id: "ultra",
    name: "Ultra",
    price: 79.99,
    credits: 45000,
    features: [
      "45,000 credits per month",
      "All AI models + early access",
      "4K output quality",
      "Fastest generation queue",
      "Chrome extension access",
      "API access",
      "Priority support",
    ],
    popular: false,
    color: "gold",
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 199.99,
    credits: 999999,
    features: [
      "Unlimited credits",
      "All AI models + beta models",
      "4K output quality",
      "Dedicated generation server",
      "Chrome extension access",
      "Full API access",
      "Dedicated account manager",
    ],
    popular: false,
    color: "red",
  },
];

router.get("/plans", (_req, res): void => {
  res.json(PLANS);
});

export default router;
