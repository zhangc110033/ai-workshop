# NFR Design Patterns — AI Workshop

## Pattern 1: Retry with Exponential Backoff
- **适用**: GitHubService (gh CLI 调用)
- **实现**: 封装 `withRetry(fn, maxRetries=3, baseDelay=1000)` 工具函数
- **策略**: 1s → 2s → 4s，仅对可重试错误（超时、网络错误）重试
- **不重试**: 认证失败、权限不足、404

## Pattern 2: Bulkhead (任务隔离)
- **适用**: Scheduler → Agents
- **实现**: Promise.allSettled 确保单个 Agent 失败不影响其他
- **日志**: 每个 Agent 的结果独立记录

## Pattern 3: Circuit Breaker (简化版)
- **适用**: GitHubService
- **实现**: 连续失败 5 次后，跳过当前周期的剩余操作，下个周期重试
- **恢复**: 下一个 10 分钟周期自动重置

## Pattern 4: Graceful Shutdown
- **适用**: App
- **实现**:
  1. 监听 SIGINT/SIGTERM
  2. 停止 Scheduler（不再触发新任务）
  3. 等待正在执行的任务完成（超时 30s）
  4. 关闭数据库连接池
  5. process.exit(0)

## Pattern 5: Structured Logging
- **适用**: 全局
- **实现**: pino logger，JSON 格式输出到 stdout
- **字段**: timestamp, level, msg, agent, operation, targetId, duration
- **子 logger**: 每个 Agent 创建带 agent 字段的子 logger

## Pattern 6: Health Check on Startup
- **适用**: App.bootstrap()
- **检查项**:
  1. `gh auth status` — 验证 gh CLI 已认证
  2. 数据库连接测试 — `SELECT 1`
  3. 规则文件存在性检查
  4. 环境变量完整性检查
- **失败行为**: 记录错误，process.exit(1)

## Pattern 7: Configuration Validation
- **适用**: ConfigService
- **实现**: 启动时验证所有必要环境变量，缺失时抛出明确错误
- **解析**: REPOSITORY_URL 支持 SSH 和 HTTPS 格式，统一解析为 owner/repo

## Pattern 8: Audit Trail
- **适用**: 所有 Agent
- **实现**: 每次操作后立即写入审计日志
- **容错**: 审计写入失败时记录到本地日志，不中断主流程
