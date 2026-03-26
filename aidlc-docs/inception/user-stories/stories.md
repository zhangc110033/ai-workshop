# User Stories — AI Workshop

## Epic 1: PR 自动 Review

### US-01: PR 自动 Review 与 Approve
**作为** 开发者，**我希望** 我提交的 PR 能在 10 分钟内被自动 Review，**以便** 我不需要等待人工 Review 就能获得反馈。

**验收标准:**
- Given 目标仓库有一个 open 的 PR
- When 定时任务执行 PR 巡检
- Then PR 被自动 Review，评论带有前缀 "from AI Workshop: "

- Given PR 内容没有 red flag（根据 /rules/pr-review-rules.md）
- When Review 完成
- Then PR 被自动 approve

- Given PR 内容存在 red flag
- When Review 完成
- Then PR 不被 approve，评论中说明具体问题

### US-02: PR Review Red Flag 检测
**作为** 团队管理者，**我希望** 系统能根据预定义规则检测 PR 中的风险，**以便** 有问题的代码不会被自动放行。

**验收标准:**
- Given /rules/pr-review-rules.md 中定义了 red flag 规则
- When 系统 Review 一个包含敏感文件变更的 PR
- Then 该 PR 不被 approve，评论中列出具体的 red flag

- Given /rules/pr-review-rules.md 被修改
- When 下一次定时任务执行
- Then 使用更新后的规则进行 Review

---

## Epic 2: Issue 自动回复与 SPAM 检测

### US-03: Issue 自动回复
**作为** 外部贡献者，**我希望** 我提交的 Issue 能在 10 分钟内收到自动回复，**以便** 我知道 Issue 已被关注。

**验收标准:**
- Given 目标仓库有 open 的 Issue 且未被处理过
- When 定时任务执行 Issue 巡检
- Then 最多处理 3 条 Issue，每条 Issue 收到上下文相关的评论
- And 评论带有前缀 "from AI Workshop: "

- Given 仓库有超过 3 条未处理的 open Issue
- When 定时任务执行
- Then 仅处理最多 3 条，其余留待下次处理

### US-04: SPAM Issue 自动关闭
**作为** 团队管理者，**我希望** SPAM Issue 被自动识别并关闭，**以便** 团队不需要浪费时间处理垃圾信息。

**验收标准:**
- Given 一个 Issue 内容为广告/无意义内容/恶意链接
- When 定时任务执行 Issue 巡检
- Then 该 Issue 被判定为 SPAM 并直接关闭

- Given 一个正常的 Issue
- When 定时任务执行 Issue 巡检
- Then 该 Issue 不被关闭，而是收到上下文相关的评论回复

### US-05: Issue 上下文理解
**作为** 开发者，**我希望** 自动回复能结合仓库上下文（README、代码结构等），**以便** 回复内容有实际参考价值。

**验收标准:**
- Given 一个关于特定功能的 Issue
- When 系统生成回复
- Then 回复内容引用了仓库中相关的代码或文档
- And 回复对 Issue 描述的问题给出了有针对性的建议

---

## Epic 3: Issue 自动打标

### US-06: Issue 自动分类打标
**作为** 团队管理者，**我希望** open 的 Issue 被自动分类并打上对应 label，**以便** 我能快速了解 Issue 的类型分布。

**验收标准:**
- Given 一个新的 open Issue 没有分类标签
- When 定时任务执行 Issue 打标巡检
- Then Issue 被打上一个分类 label（根据 /rules/issue-labeling-rules.md）
- And Issue 被打上 "tagged" label 表示标记完成

- Given 一个已有 "tagged" label 的 Issue
- When 定时任务执行
- Then 该 Issue 被跳过，不重复打标

### US-07: 标签分类规则配置
**作为** 团队管理者，**我希望** 标签分类规则可以通过配置文件修改，**以便** 我能根据团队需要调整分类体系。

**验收标准:**
- Given /rules/issue-labeling-rules.md 定义了标签分类规则
- When 管理员修改规则文件
- Then 下一次定时任务使用更新后的规则

### US-08: 防止重复打标
**作为** 团队管理者，**我希望** 系统不会对已打标的 Issue 重复操作，**以便** 避免标签混乱。

**验收标准:**
- Given 一个 Issue 已有 "tagged" label
- When 定时任务执行
- Then 该 Issue 不被重新分类或添加新标签

---

## Epic 4: 审计日志

### US-09: 操作审计记录
**作为** 系统管理员，**我希望** 所有自动化操作都被记录到审计数据库，**以便** 我能追溯每一次操作的详情。

**验收标准:**
- Given 系统执行了一次 PR Review / Issue 回复 / Issue 打标 / SPAM 关闭操作
- When 操作完成
- Then 一条审计记录被写入 ai_workshop_audit_db.audit_logs
- And 记录包含 id, operation_time, operation_type, operation_log, operator_email, target_repo, target_id

- Given 定时任务执行但没有需要处理的 PR/Issue
- When 任务完成
- Then 仍然记录一条"无操作"的审计日志

### US-10: 审计日志查询
**作为** 系统管理员，**我希望** 审计日志存储在 TiDB Cloud Zero 中，**以便** 我能通过 SQL 查询历史操作记录。

**验收标准:**
- Given 审计日志已写入数据库
- When 管理员执行 SQL 查询
- Then 能按时间、操作类型、目标仓库等条件筛选记录

---

## Epic 5: 规则配置

### US-11: 规则文件管理
**作为** 系统管理员，**我希望** 所有 AI 判断规则存放在 /rules/*.md 文件中，**以便** 我能独立于代码修改规则。

**验收标准:**
- Given /rules/ 目录下有规则文件
- When 系统启动或规则文件被修改
- Then 系统加载最新的规则内容

- Given 规则文件格式错误
- When 系统尝试加载
- Then 系统记录错误日志并使用上一次有效的规则

---

## Epic 6: 系统运维

### US-12: 定时任务调度
**作为** 团队管理者，**我希望** 所有巡检任务每 10 分钟自动执行，**以便** 系统持续监控仓库状态。

**验收标准:**
- Given 系统已启动
- When 每隔 10 分钟
- Then PR Review、Issue 回复、Issue 打标三个任务依次执行

### US-13: 任务失败容错
**作为** 团队管理者，**我希望** 单个任务失败不影响其他任务执行，**以便** 系统保持整体可用。

**验收标准:**
- Given PR Review 任务执行失败（如 gh CLI 超时）
- When 错误被捕获
- Then 错误被记录到日志和审计数据库
- And Issue 回复和 Issue 打标任务继续正常执行

### US-14: 系统启动与健康检查
**作为** 系统管理员，**我希望** 系统启动时验证所有依赖（gh CLI、数据库连接、规则文件），**以便** 我能及时发现配置问题。

**验收标准:**
- Given 系统启动
- When 依赖检查执行
- Then 验证 gh CLI 已登录、数据库可连接、规则文件存在
- And 如果任何依赖不可用，记录错误并退出

### US-15: 环境变量配置
**作为** 系统管理员，**我希望** 通过环境变量配置目标仓库和操作者信息，**以便** 部署时灵活调整。

**验收标准:**
- Given .env 文件中配置了 REPOSITORY_URL 和 OPERATOR_EMAIL
- When 系统启动
- Then 使用环境变量中的值进行操作
- And 如果必要的环境变量缺失，系统报错并退出

---

## Story-Persona Mapping

| Story | Developer | Team Lead | Admin | External Contributor |
|-------|-----------|-----------|-------|---------------------|
| US-01 | ✅ | | | ✅ |
| US-02 | | ✅ | | |
| US-03 | | | | ✅ |
| US-04 | | ✅ | | |
| US-05 | ✅ | | | |
| US-06 | | ✅ | | |
| US-07 | | ✅ | | |
| US-08 | | ✅ | | |
| US-09 | | | ✅ | |
| US-10 | | | ✅ | |
| US-11 | | | ✅ | |
| US-12 | | ✅ | | |
| US-13 | | ✅ | | |
| US-14 | | | ✅ | |
| US-15 | | | ✅ | |
