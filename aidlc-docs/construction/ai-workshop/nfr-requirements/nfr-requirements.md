# NFR Requirements — AI Workshop

## NFR-01: Performance
- 单次定时任务执行时间 < 5 分钟（10 分钟间隔内完成）
- gh CLI 单次命令超时: 30 秒
- 数据库写入超时: 10 秒
- Issue 处理每次最多 3 条

## NFR-02: Reliability
- 单个 Agent 失败不影响其他 Agent（Promise.allSettled）
- gh CLI 调用失败自动重试（最多 3 次，指数退避: 1s, 2s, 4s）
- 数据库连接断开自动重连（mysql2 连接池内置）
- 全局 uncaughtException / unhandledRejection 处理器
- 规则文件解析失败时 fallback 到上次有效规则

## NFR-03: Security (SECURITY-01 ~ SECURITY-15)
- **SECURITY-01**: 数据库连接使用 TLS（mysql2 ssl: true）
- **SECURITY-03**: 结构化日志（winston/pino），包含 timestamp, level, message, correlationId
- **SECURITY-05**: 规则文件输入验证（Markdown 解析前检查格式）
- **SECURITY-09**: 不硬编码凭证，敏感信息通过环境变量；错误响应不暴露内部细节
- **SECURITY-10**: package-lock.json 锁定依赖版本；npm audit 检查漏洞
- **SECURITY-11**: 安全逻辑（规则引擎、SPAM 检测）封装在独立模块
- **SECURITY-13**: 审计日志记录所有操作（who, what, when）
- **SECURITY-14**: 审计日志存储在 TiDB（应用无法删除自己的日志）
- **SECURITY-15**: 所有外部调用（gh CLI, DB）有 try/catch；全局错误处理器

## NFR-04: Observability
- 结构化日志输出到 stdout（JSON 格式）
- 每次定时任务记录: 开始时间、结束时间、处理数量、成功/失败
- 错误日志包含完整上下文（Agent 名称、操作类型、目标 ID）
- 审计日志写入 TiDB（持久化）

## NFR-05: Maintainability
- TypeScript 严格模式（strict: true）
- ESLint + Prettier 代码规范
- 规则文件与代码分离（/rules/*.md）
- 模块化设计（经典分层: agents/, services/, rules/）

## NFR-06: Availability
- 服务设计为长驻进程，支持 SIGINT/SIGTERM 优雅关闭
- 关闭时等待正在执行的任务完成（超时 30 秒）
- 启动时健康检查（gh CLI 认证、数据库连接、规则文件）

## Security Compliance Summary (SECURITY-01 ~ SECURITY-15)

| Rule | Status | Notes |
|------|--------|-------|
| SECURITY-01 | Compliant | TLS for DB connection |
| SECURITY-02 | N/A | No load balancer/API gateway (local service) |
| SECURITY-03 | Compliant | Structured logging (winston/pino) |
| SECURITY-04 | N/A | No web UI / HTML endpoints |
| SECURITY-05 | Compliant | Rule file input validation |
| SECURITY-06 | N/A | No IAM policies (local service, gh CLI auth) |
| SECURITY-07 | N/A | No network infrastructure (local service) |
| SECURITY-08 | N/A | No user-facing API endpoints |
| SECURITY-09 | Compliant | No hardcoded credentials, generic error messages |
| SECURITY-10 | Compliant | Lock file, npm audit |
| SECURITY-11 | Compliant | Security logic in dedicated modules |
| SECURITY-12 | N/A | No user authentication (uses gh CLI session) |
| SECURITY-13 | Compliant | Audit trail for all operations |
| SECURITY-14 | Compliant | Audit logs in TiDB, app cannot delete |
| SECURITY-15 | Compliant | Global error handler, try/catch on all external calls |
