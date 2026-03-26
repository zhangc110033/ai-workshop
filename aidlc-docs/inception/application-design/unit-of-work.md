# Units of Work — AI Workshop

## Deployment Model
单体 Node.js (TypeScript) 服务，单进程部署，按功能模块分层组织代码。

## Code Organization (经典分层)
```
src/
  agents/           # Agent 业务逻辑
    pr-review.ts
    issue-reply.ts
    issue-label.ts
  services/         # 基础服务层
    github.ts
    audit.ts
    config.ts
  rules/            # 规则引擎
    engine.ts
    types.ts
  scheduler/        # 调度器
    scheduler.ts
  types/            # 共享类型定义
    index.ts
  app.ts            # 应用入口
rules/              # 规则配置文件（Markdown）
  pr-review-rules.md
  spam-detection-rules.md
  issue-labeling-rules.md
```

---

## Unit 1: Core Infrastructure
- **范围**: 应用入口、配置管理、调度器、共享类型
- **组件**: App (C-09), ConfigService (C-08), Scheduler (C-07)
- **职责**:
  - 应用生命周期管理（启动、关闭）
  - 环境变量验证
  - 定时任务调度（node-cron, 10 分钟间隔）
  - 全局错误处理
  - 依赖健康检查
- **代码路径**: `src/app.ts`, `src/scheduler/`, `src/services/config.ts`, `src/types/`

## Unit 2: GitHub Integration
- **范围**: GitHub 交互服务、gh CLI 封装
- **组件**: GitHubService (C-04)
- **职责**:
  - 封装所有 gh CLI 命令
  - PR 列表/Review/Approve
  - Issue 列表/评论/关闭/打标
  - 仓库上下文获取
  - 命令超时和重试
- **代码路径**: `src/services/github.ts`

## Unit 3: Rule Engine
- **范围**: 规则文件加载、解析、缓存
- **组件**: RuleEngine (C-06)
- **职责**:
  - 加载 /rules/*.md 文件
  - 解析 Markdown 规则为结构化数据
  - 缓存规则，支持重新加载
  - 解析失败时 fallback 到上次有效规则
- **代码路径**: `src/rules/`, `rules/*.md`

## Unit 4: Agents (Business Logic)
- **范围**: 三个 Agent 的业务逻辑
- **组件**: PRReviewAgent (C-01), IssueReplyAgent (C-02), IssueLabelAgent (C-03)
- **职责**:
  - PR Review: 获取 diff → 规则检查 → approve 或评论
  - Issue Reply: 获取 Issue → SPAM 检测 → 回复或关闭
  - Issue Label: 获取 Issue → 分类 → 打标 + tagged
  - 所有评论带 "from AI Workshop: " 前缀
- **代码路径**: `src/agents/`

## Unit 5: Audit & Persistence
- **范围**: 审计日志服务、数据库交互
- **组件**: AuditService (C-05)
- **职责**:
  - TiDB Cloud Zero 连接管理（mysql2 连接池）
  - 审计表初始化（CREATE TABLE IF NOT EXISTS）
  - 审计日志写入
  - TLS 连接
  - 连接断开自动重连
- **代码路径**: `src/services/audit.ts`
