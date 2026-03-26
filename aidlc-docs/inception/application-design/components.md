# Components — AI Workshop

## C-01: PRReviewAgent
- **职责**: 自动巡检目标仓库的 open PR，执行 Review，根据规则判断是否 approve
- **接口**:
  - `execute(): Promise<PRReviewResult[]>` — 执行一轮 PR Review 巡检
- **依赖**: GitHubService, RuleEngine, AuditService

## C-02: IssueReplyAgent
- **职责**: 自动巡检目标仓库的 open Issue，生成上下文相关回复，检测并关闭 SPAM
- **接口**:
  - `execute(): Promise<IssueReplyResult[]>` — 执行一轮 Issue 回复巡检（最多 3 条）
- **依赖**: GitHubService, RuleEngine, AuditService

## C-03: IssueLabelAgent
- **职责**: 自动为 open Issue 分类打标，跳过已标记的 Issue
- **接口**:
  - `execute(): Promise<IssueLabelResult[]>` — 执行一轮 Issue 打标巡检
- **依赖**: GitHubService, RuleEngine, AuditService

## C-04: GitHubService
- **职责**: 封装所有 GitHub 交互操作（通过 gh CLI）
- **接口**:
  - `listOpenPRs(): Promise<PR[]>`
  - `reviewPR(prNumber, body, approve): Promise<void>`
  - `listOpenIssues(): Promise<Issue[]>`
  - `commentOnIssue(issueNumber, body): Promise<void>`
  - `closeIssue(issueNumber): Promise<void>`
  - `addLabel(issueNumber, label): Promise<void>`
  - `getIssueLabels(issueNumber): Promise<string[]>`
  - `getRepoContext(): Promise<RepoContext>` — 获取仓库 README、结构等上下文
- **依赖**: ConfigService (for REPOSITORY_URL)

## C-05: AuditService
- **职责**: 将所有操作记录写入 TiDB Cloud Zero 审计数据库
- **接口**:
  - `log(entry: AuditEntry): Promise<void>`
  - `initialize(): Promise<void>` — 初始化数据库连接和表结构
- **依赖**: ConfigService (for DATABASE_URL, OPERATOR_EMAIL)

## C-06: RuleEngine
- **职责**: 加载和解析 /rules/*.md 规则文件，提供规则查询接口
- **接口**:
  - `loadRules(): Promise<void>` — 加载所有规则文件
  - `getPRReviewRules(): PRReviewRules`
  - `getSpamDetectionRules(): SpamDetectionRules`
  - `getIssueLabelingRules(): IssueLabelingRules`
- **依赖**: 文件系统（/rules/*.md）

## C-07: Scheduler
- **职责**: 管理定时任务调度，每 10 分钟并行触发三个 Agent
- **接口**:
  - `start(): void` — 启动调度器
  - `stop(): void` — 停止调度器
- **依赖**: PRReviewAgent, IssueReplyAgent, IssueLabelAgent

## C-08: ConfigService
- **职责**: 管理环境变量和配置
- **接口**:
  - `get(key: string): string`
  - `validate(): void` — 验证必要环境变量存在
- **依赖**: 环境变量（.env）

## C-09: App (Entry Point)
- **职责**: 应用入口，初始化所有组件，启动调度器，全局错误处理
- **接口**:
  - `bootstrap(): Promise<void>` — 初始化并启动
  - `shutdown(): Promise<void>` — 优雅关闭
- **依赖**: 所有组件
