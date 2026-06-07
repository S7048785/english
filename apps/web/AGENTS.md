# 前端 AGENTS.md

## 技术栈

- Vue 3 + TypeScript 6（严格模式）
- Vite 8 + Tailwind CSS 4 + Nuxt UI 4
- Pinia 3（带 `pinia-plugin-persistedstate`）
- Vue Router 5（文件路由：`vue-router/auto-routes`）
- Axios（拦截器配置在 `src/api/index.ts`）

## 命令

```bash
# 从仓库根目录运行
pnpm web              # 开发服务器（端口 5173）
pnpm run build        # 生产构建（vue-tsc + vite build）

# 从 apps/web 目录运行
pnpm run dev          # 开发服务器
pnpm run build        # 生产构建
pnpm run format       # oxfmt 格式化
pnpm run type-check   # vue-tsc 类型检查
```

## 目录结构

```
src/
├── api/           # API 调用（serverInstance, aiInstance）
├── components/    # 组件
├── composables/   # 组合式函数（business/, core/）
├── features/      # 功能模块（chat/, home/）
├── plugins/       # 插件注册（Pinia, Router, Nuxt UI）
├── stores/        # Pinia stores（user.ts, chat.ts, payment.ts）
├── styles/        # Tailwind CSS 入口
├── views/         # 页面（自动生成路由）
└── utils/         # 工具函数
```

## 关键架构

- **文件路由**: `src/views/` 下的 `.vue` 文件自动生成路由，无需手动配置
- **路由守卫**: `router/index.ts` 中检查 `meta.requiresAuth`，未登录时弹出登录弹窗
- **API 代理**: `/api` → `localhost:3000`，`/ai` → `localhost:3001`（端口来自 `@en/config`）
- **自动导入**: `unplugin-auto-import` + `unplugin-vue-components` 生成 `auto-imports.d.ts` 和 `components.d.ts`
- **路径别名**: `@/` → `src/`，`@en/` → `packages/`

## 代码规范

- 使用 `oxfmt` 格式化，不要使用 ESLint
- 组件使用 `<script setup lang="ts">`
- Store 使用 Pinia 的 `defineStore` + Composition API
- API 调用使用 `src/api/index.ts` 导出的 `serverInstance` 或 `aiInstance`

## 注意事项

- `.agents/` 目录被 gitignore（AI 代理配置）
- `auto-imports.d.ts` 和 `components.d.ts` 是自动生成的，不要手动编辑
- 生产构建命令: `run-p type-check "build-only {@}" --`（并行执行类型检查和构建）
- 使用 `@en/config` 获取端口配置，不要硬编码
