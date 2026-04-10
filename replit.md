# BunnyFlow AI Platform

## Overview

BunnyFlow is an AI video/image generation SaaS platform powered by Google Flow sessions. Users register, purchase plans with credits, and generate media via a dashboard and Chrome extension. Admins manage sessions (Google Flow cookie injection), users, credits, and feature flags.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### flow-platform (React + Vite, preview path: /)
User portal with dark UI. Pages: Landing, Login, Register, Pricing, Extension Download, Dashboard, Generate Video, Generate Image, Generations History, Admin Panel.

### api-server (Express 5, port 8080)
REST API with JWT auth. Routes:
- `/api/auth/*` — register, login, logout, me
- `/api/credits` — credit balance and history
- `/api/generations/*` — create, list, stats
- `/api/plans` — all subscription plans
- `/api/extension/*` — cookie delivery and feature settings
- `/api/admin/*` — admin CRUD (sessions, users, stats, settings)

## Auth

- User JWT stored in localStorage as `flow_token`; also synced as `__flow_auth__` JSON (for Chrome extension)
- Admin: POST /api/admin/login with email `admin@bunnyflow.app`, password `admin123`; returns ADMIN_KEY `flow-admin-2024` used as `x-admin-key` header

## Credit System

- Video: 20 credits, Image: 5 credits
- Plans: Free(500), Basic(5000), Starter(25000), Pro(10000), Ultra(45000), Unlimited(999999)

## DB Schema (PostgreSQL + Drizzle)

Tables: `users`, `generations`, `flow_sessions`, `admin_settings`, `credit_transactions`
