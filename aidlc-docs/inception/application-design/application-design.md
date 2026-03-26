# Application Design — AI Workshop (Consolidated)

## 1. Architecture Overview

AI Workshop 是一个 Node.js (TypeScript) 后台服务，通过定时调度并行执行三个 Agent，自动化 GitHub 仓库的 PR Review、Issue 回复/SPAM 检测、Issue 打标，并将所有操作记录写入 TiDB Cloud Zero 审计数据库。

### 核心架构决策
- **运行模式**: 长驻 Node.js 进程 + node-cron 内置调度
- **GitHub 交互**: 通过本地 gh CLI（已登录），不使用 API SDK
- **数据库**: TiDB Cloud Zero（MySQL 兼容），通过 mysql2 连接池
- **规则引擎**: Markdown 文件驱动（/rules/*.md），启动时加载
- **执行策略**: 三个 Agent 并行执行（Promise.allSettled），互不影响

## 2. Components (9 个)

| ID | Component | 职责 |
|----|-----------|------|
| C-01 | PRReviewAgent | PR 自动 Review 与 Approve |
| C-02 | IssueReplyAgent | Issue 自动回复与 SPAM 检测 |
| C-03 | IssueLabelAgent | Issue 自动分类打标 |
| C-04 | GitHubService | 封装 gh CLI 交互 |
| C-05 | AuditService | 审计日志写入 TiDB |
| C-06 | RuleEngine | 规则文件加载与解析 |
| C-07 | Scheduler | 定时任务调度（10 分钟间隔） |
| C-08 | ConfigService | 环境变量管理 |
| C-09 | App | 应用入口与生命周期管理 |

详见: [components.md](components.md)

## 3. Services (5 个)

| ID | Service | 类型 |
|----|---------|------|
| S-01 | Scheduler Service | 调度编排 |
| S-02 | GitHub Interaction Service | 外部集成 |
| S-03 | Audit Service | 数据持久化 |
| S-04 | Rule Engine Service | 配置管理 |
| S-05 | Config Service | 配置管理 |

详见: [services.md](services.md)

## 4. Data Flow

```
Scheduler (10min cron)
    |
    +---> PRReviewAgent ---> GitHubService (gh pr list/review) ---> AuditService
    |
    +---> IssueReplyAgent ---> GitHubService (gh issue list/comment/close) ---> AuditService
    |
    +---> IssueLabelAgent ---> GitHubService (gh issue edit --add-label) ---> AuditService
```

详见: [component-dependency.md](component-dependency.md)

## 5. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| GitHub 交互方式 | gh CLI | 用户已登录，无需管理 token |
| 定时调度 | node-cron | 轻量，内置于 Node.js 进程 |
| 任务执行策略 | 并行（Promise.allSettled） | 效率高，互不影响 |
| 规则存储 | /rules/*.md | 与代码分离，便于修改 |
| 数据库 | TiDB Cloud Zero (mysql2) | MySQL 兼容，TLS 连接 |
| 错误处理 | 全局 + 任务级 | 单任务失败不影响整体 |

## 6. Security Considerations

- 环境变量管理敏感信息（DATABASE_URL, OPERATOR_EMAIL）
- 数据库连接强制 TLS
- 日志中不记录 token/密码
- 全局错误处理器防止信息泄露
- 规则文件解析失败时 fail-safe（使用上次有效规则）

详见: [component-methods.md](component-methods.md)
