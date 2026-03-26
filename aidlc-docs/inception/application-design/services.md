# Services — AI Workshop

## S-01: Scheduler Service
- **类型**: 调度编排
- **职责**: 管理三个 Agent 的定时执行
- **模式**: node-cron，每 10 分钟触发一次
- **执行策略**: 并行执行三个 Agent（Promise.allSettled）
- **容错**: 单个 Agent 失败不影响其他 Agent，失败记录到审计日志
- **交互**:
  - 触发 → PRReviewAgent.execute()
  - 触发 → IssueReplyAgent.execute()
  - 触发 → IssueLabelAgent.execute()

## S-02: GitHub Interaction Service
- **类型**: 外部集成
- **职责**: 封装所有 gh CLI 调用，提供类型安全的接口
- **模式**: 命令行执行（child_process.exec）
- **容错**: 命令超时处理、重试机制（最多 3 次，指数退避）
- **交互**:
  - 被调用 ← PRReviewAgent, IssueReplyAgent, IssueLabelAgent
  - 调用 → gh CLI（本地已登录）

## S-03: Audit Service
- **类型**: 数据持久化
- **职责**: 审计日志写入 TiDB Cloud Zero
- **模式**: MySQL 连接池（mysql2）
- **容错**: 连接断开自动重连，写入失败记录到本地日志
- **交互**:
  - 被调用 ← PRReviewAgent, IssueReplyAgent, IssueLabelAgent, Scheduler
  - 调用 → TiDB Cloud Zero (MySQL protocol over TLS)

## S-04: Rule Engine Service
- **类型**: 配置管理
- **职责**: 加载、解析、缓存 /rules/*.md 规则文件
- **模式**: 启动时加载，支持运行时重新加载
- **容错**: 规则文件解析失败时使用上次有效规则
- **交互**:
  - 被调用 ← PRReviewAgent, IssueReplyAgent, IssueLabelAgent
  - 读取 → /rules/*.md 文件

## S-05: Config Service
- **类型**: 配置管理
- **职责**: 环境变量管理和验证
- **模式**: dotenv 加载 + 启动时验证
- **交互**:
  - 被调用 ← 所有组件
  - 读取 → .env 文件 / 环境变量
