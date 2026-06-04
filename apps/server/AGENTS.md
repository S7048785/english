# AGENTS.md — apps/server (Elysia 后端) 工程规范

## 技术栈

- **运行时**: Bun（不是 Node.js）
- **包管理器**: pnpm
- **框架**: Elysia.js（类 Express 的 TypeScript 框架）
- **ORM**: Drizzle ORM（PostgreSQL）
- **验证**: Zod（DTO）
- **认证**: JWT（@elysia/jwt）+ bcrypt

## 命令

```bash
# 开发模式（监听文件变化自动重启）
bun run start

# 类型检查
bun run typecheck

# 从 monorepo 根目录运行
pnpm elysia
```

## 目录结构

```
apps/server/
├── main.ts              # 入口文件，Elysia 应用定义
├── drizzle/
│   ├── schema.ts        # 数据库表定义（Drizzle schema）
│   ├── relations.ts     # 表关系定义
│   └── migrations/      # SQL 迁移文件
├── src/
│   ├── db/index.ts      # 数据库连接实例
│   ├── modules/         # 业务模块
│   │   ├── auth/        # 认证模块（登录/注册/刷新令牌）
│   │   └── word-book/   # 单词本模块（分页查询）
│   ├── plugins/auth.ts  # JWT 认证插件
│   └── utils/password.ts # bcrypt 密码工具
```

## 模块模式

每个模块遵循此结构：

- `index.ts` — 路由定义（使用 Elysia 的 `group` 和 `use`）
- `service.ts` — 业务逻辑
- `repository.ts` — 数据库操作
- `dto/` — Zod 验证 schema

示例：`src/modules/word-book/index.ts` 定义路由，`service.ts` 处理逻辑。

## 数据库

- Schema 文件：`drizzle/schema.ts`（表定义）
- 关系文件：`drizzle/relations.ts`（外键关系）
- 连接实例：`src/db/index.ts`（使用 `process.env.DATABASE_URL`）
- 迁移：`drizzle/` 目录下的 SQL 文件

**重要**：表名使用 PascalCase（如 `User`、`WordBook`），与 Prisma 命名一致。

## 环境变量

从 `.env` 文件加载（通过 dotenv）：

- `DATABASE_URL` — PostgreSQL 连接字符串
- `SECRET_KEY` — JWT 签名密钥
- `MINIO_*` — MinIO 对象存储配置
- `AI_*` — AI 模型配置（DeepSeek via 阿里云 DashScope）
- `ALIPAY_*` — 支付宝支付配置

**注意**：`.env` 包含敏感信息，不要提交到 Git。

## 路径别名

在 `tsconfig.json` 中定义：

- `@/*` → `./src/*`
- `@env` → `./env.config.ts`

## 认证流程

1. `authPlugin`（`src/plugins/auth.ts`）拦截所有请求验证 JWT，将公开的路由和受保护的路由分开定义，用拦截器authPlugin进行隔开。
2. 令牌在 `Authorization: Bearer <token>` 头中传递
3. 访问令牌默认 7 天过期
4. 刷新令牌用于获取新的访问令牌