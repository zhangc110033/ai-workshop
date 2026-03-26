# Tech Stack Decisions — AI Workshop

| Category | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node.js 20 LTS + TypeScript 5.x | 用户指定 Node.js，LTS 版本稳定 |
| Package Manager | npm (with package-lock.json) | 标准，锁定依赖版本 |
| Scheduler | node-cron | 轻量内置调度，无需外部依赖 |
| GitHub CLI | gh (pre-installed, authenticated) | 用户指定，无需管理 token |
| Database Driver | mysql2 | TiDB Cloud Zero 兼容 MySQL 协议，支持连接池和 TLS |
| Logging | pino | 高性能结构化 JSON 日志，低开销 |
| Env Management | dotenv | 标准 .env 文件加载 |
| Linting | ESLint + @typescript-eslint | TypeScript 代码规范 |
| Formatting | Prettier | 统一代码格式 |
| Build | tsc (TypeScript compiler) | 简单直接，无需 bundler |
| Testing | vitest | 快速，TypeScript 原生支持 |
| Process Management | 原生 Node.js (SIGINT/SIGTERM) | 轻量，无需 PM2 |

## Dependencies (预估)

### Production
```json
{
  "node-cron": "^3.x",
  "mysql2": "^3.x",
  "pino": "^9.x",
  "dotenv": "^16.x"
}
```

### Development
```json
{
  "@types/node": "^20.x",
  "@types/node-cron": "^3.x",
  "typescript": "^5.x",
  "vitest": "^2.x",
  "eslint": "^9.x",
  "@typescript-eslint/eslint-plugin": "^8.x",
  "@typescript-eslint/parser": "^8.x",
  "prettier": "^3.x"
}
```
