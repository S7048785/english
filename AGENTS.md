# AGENTS.md

## 项目概览

pnpm monorepo 英语学习应用。三个工作区根目录：`apps/*`、`server`、`packages/*`。

**前端**: `apps/web` — Vue 3 + Vite + Tailwind CSS + Nuxt UI + Pinia  
**后端 (NestJS)**: `server/` — NestJS 单仓库含两个应用 + 共享库
**共享包**: `packages/common` (`@en/common`)、`packages/config` (`@en/config`)

## 命令

```bash
# 安装依赖（从仓库根目录）
pnpm install

# 前端开发服务器
pnpm web

# NestJS 后端（监听模式）
pnpm server

# Elysia 后端（Bun 运行时）
pnpm elysia

# AI 聊天服务（NestJS）
pnpm ai

# 所有服务并行运行
pnpm all

# 前端 + NestJS 仅
pnpm two

# 生产环境构建前端
pnpm run build
```

## NestJS 单仓库结构 (`server/`)

`server/` 目录本身是一个 NestJS 单仓库：

- `server/apps/server` — 主 REST API（用户、单词本、支付、课程）
- `server/apps/ai` — AI 聊天服务（LangChain + DeepSeek）
- `server/libs/shared` — 共享库；Prisma 客户端在此生成

从 `server/` 目录运行 NestJS 命令：

```bash
pnpm run lint        # oxlint（不是 eslint）
pnpm run lint:fix    # oxlint --ts --fix
pnpm run test        # Jest 单元测试
pnpm run test:e2e    # Jest e2e 测试
pnpm run build       # nest build
```

## 代码检查和格式化

- **后端**: `oxlint`（配置在 `server/oxlint.json`），`prettier` 用于格式化
- **前端**: `oxfmt` 用于格式化（在 `apps/web` 中运行 `pnpm run format`）
- 任何地方都不要使用 ESLint — 不要添加它

## 共享包

- `@en/config` — 直接导出 TypeScript 源码（`index.ts`），不是编译后的 JS
- `@en/common` — 编译到 `dist/`；导出子路径：`response`、`word`、`user`、`chat`、`course`、`pay`
- 两者都通过 `workspace:*` 协议被前端和后端使用

## 关键架构说明

- 两个独立的后端：NestJS（Node.js）和 Elysia（Bun）。NestJS不再继续
- `pnpm-workspace.yaml` 有 `allowBuilds` 条目需要明确设置为 true/false
- 前端自动导入：`unplugin-auto-import` + `unplugin-vue-components` 生成 `auto-imports.d.ts` 和 `components.d.ts`
- 前端使用文件路由（`vue-router/auto-routes`）
- 前端通过 Vite 配置代理到后端：`/api` → NestJS，`/ai` → AI 服务
- Node.js 版本要求：`^20.19.0 || >=22.12.0`

## 文件约定

- 全部使用 TypeScript，严格模式
-
- `.agents/` 目录被 gitignore（AI 代理配置）

# 项目规范

- 默认使用中文回答。
- 修改代码前，先说明计划。
- 不要主动引入新依赖，除非明确说明原因。
- 不要重构无关文件。
- 尽量使用注释解释代码，特别是复杂逻辑。
