# Component Methods — AI Workshop

## C-01: PRReviewAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `execute()` | — | `Promise<PRReviewResult[]>` | 获取 open PR 列表，逐个 Review，根据规则判断 approve 或留评论 |

## C-02: IssueReplyAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `execute()` | — | `Promise<IssueReplyResult[]>` | 获取 open Issue（最多 3 条），判断 SPAM 或生成回复 |

## C-03: IssueLabelAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `execute()` | — | `Promise<IssueLabelResult[]>` | 获取 open Issue，跳过已 tagged 的，分类打标 |

## C-04: GitHubService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `listOpenPRs()` | — | `Promise<PR[]>` | 通过 gh CLI 列出 open PR |
| `reviewPR(prNumber, body, approve)` | number, string, boolean | `Promise<void>` | 提交 PR Review（approve 或 comment） |
| `listOpenIssues()` | — | `Promise<Issue[]>` | 通过 gh CLI 列出 open Issue |
| `commentOnIssue(issueNumber, body)` | number, string | `Promise<void>` | 在 Issue 上添加评论 |
| `closeIssue(issueNumber)` | number | `Promise<void>` | 关闭 Issue |
| `addLabel(issueNumber, label)` | number, string | `Promise<void>` | 为 Issue 添加 label |
| `getIssueLabels(issueNumber)` | number | `Promise<string[]>` | 获取 Issue 的 labels |
| `getRepoContext()` | — | `Promise<RepoContext>` | 获取仓库上下文（README 等） |
| `getPRDiff(prNumber)` | number | `Promise<string>` | 获取 PR 的 diff 内容 |

## C-05: AuditService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `log(entry)` | `AuditEntry` | `Promise<void>` | 写入审计日志到 TiDB |
| `initialize()` | — | `Promise<void>` | 初始化数据库连接，确保表存在 |
| `close()` | — | `Promise<void>` | 关闭数据库连接 |

## C-06: RuleEngine

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `loadRules()` | — | `Promise<void>` | 从 /rules/*.md 加载规则 |
| `getPRReviewRules()` | — | `PRReviewRules` | 返回 PR Review 规则 |
| `getSpamDetectionRules()` | — | `SpamDetectionRules` | 返回 SPAM 检测规则 |
| `getIssueLabelingRules()` | — | `IssueLabelingRules` | 返回 Issue 标签规则 |

## C-07: Scheduler

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `start()` | — | `void` | 启动 cron 调度，每 10 分钟并行触发三个 Agent |
| `stop()` | — | `void` | 停止调度器 |

## C-08: ConfigService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `get(key)` | string | `string` | 获取环境变量值 |
| `validate()` | — | `void` | 验证必要环境变量（REPOSITORY_URL, OPERATOR_EMAIL, DATABASE_URL） |

## C-09: App

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `bootstrap()` | — | `Promise<void>` | 初始化所有组件，验证依赖，启动调度器 |
| `shutdown()` | — | `Promise<void>` | 优雅关闭（停止调度、关闭数据库连接） |

---

**Note**: 详细的业务规则（如 SPAM 判定逻辑、PR red flag 检测逻辑、标签分类逻辑）将在 Functional Design 阶段定义。
