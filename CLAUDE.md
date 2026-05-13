# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo using pnpm workspaces with a Vue 3 frontend and NestJS backend. Primary focus is an English learning app with word books, courses, and AI chat features.

## Common Commands

```bash
# Frontend (Vue 3 + Vite)
pnpm web          # Start dev server on apps/web
pnpm run build    # Build web app for production

# Backend (NestJS)
pnpm server       # Start server with --watch (start:dev)
pnpm run lint    # Lint and fix code
pnpm run test    # Run unit tests

# Run both frontend and backend
pnpm all
```

## Architecture

### Frontend (`apps/web/`)
Vue 3 + Vite + Vuetify + Tailwind CSS + Pinia + Vue Router

### Backend (`server/`)
NestJS monorepo with two apps:
- `apps/server` - Main REST API (user, wordbook, payment, course management)
- `apps/ai` - AI chat service

### Database
Prisma ORM with PostgreSQL. Schema at `server/prisma/schema.prisma`, generated client output to `server/libs/shared/src/generated/prisma`.

### Shared Packages
- `@en/config` - shared configuration
- `@en/common` - shared utilities

## Key Dependencies
- Frontend: `@en/config`, `@lucide/vue`, `axios`, `pinia`, `three`, `vue-router`, `vuetify`
- Backend: `@en/common`, `@en/config`, `@nestjs/*`, `@prisma/client`, `@scalar/nestjs-api-reference`, `nestjs-zod`
