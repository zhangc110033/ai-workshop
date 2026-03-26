# Business Rules — AI Workshop

## BR-01: Comment Prefix
- **规则**: 所有自动生成的评论必须以 `"from AI Workshop: "` 为前缀
- **适用**: PR Review 评论、Issue 回复评论
- **验证**: 评论内容必须以该前缀开头

## BR-02: Issue 处理上限
- **规则**: 每次 Issue 回复巡检最多处理 3 条 Issue
- **适用**: IssueReplyAgent
- **原因**: 避免 API 限流，控制单次执行时间

## BR-03: 防重复打标
- **规则**: 已有 `"tagged"` label 的 Issue 不再处理
- **适用**: IssueLabelAgent
- **验证**: 检查 Issue labels 是否包含 "tagged"

## BR-04: SPAM 处理策略
- **规则**: 被判定为 SPAM 的 Issue 直接关闭，不留评论
- **适用**: IssueReplyAgent
- **原因**: 避免给 SPAM 内容增加可见度

## BR-05: PR Review 策略
- **规则**: 无 red flag 的 PR 自动 approve；有 red flag 的 PR 仅留评论不 approve
- **适用**: PRReviewAgent
- **验证**: approve 操作仅在 redFlags 为空时执行

## BR-06: 规则文件 Fallback
- **规则**: 规则文件解析失败时，使用上次成功加载的规则继续运行
- **适用**: RuleEngine
- **例外**: 首次启动时如果规则文件不存在或解析失败，服务应退出

## BR-07: 审计日志完整性
- **规则**: 每次定时任务执行都必须记录审计日志，包括"无操作"的情况
- **适用**: 所有 Agent
- **字段**: operation_time, operation_type, operation_log, operator_email, target_repo, target_id

## BR-08: 环境变量必要性
- **规则**: REPOSITORY_URL, OPERATOR_EMAIL, DATABASE_URL 为必填环境变量
- **适用**: ConfigService
- **行为**: 缺失任何一个时，服务启动失败并输出明确错误信息

## BR-09: REPOSITORY_URL 解析
- **规则**: 支持 SSH 格式 (`git@github.com:owner/repo.git`) 和 HTTPS 格式 (`https://github.com/owner/repo`)
- **适用**: ConfigService
- **输出**: 解析为 `owner/repo` 格式供 gh CLI 使用

## BR-10: 任务隔离
- **规则**: 单个 Agent 执行失败不影响其他 Agent
- **适用**: Scheduler
- **实现**: 使用 Promise.allSettled 而非 Promise.all

## BR-11: 已处理 Issue 跳过
- **规则**: IssueReplyAgent 跳过已有 "from AI Workshop:" 前缀评论的 Issue
- **适用**: IssueReplyAgent
- **原因**: 避免重复回复同一个 Issue

## BR-12: 数据库连接安全
- **规则**: 数据库连接必须使用 TLS
- **适用**: AuditService
- **验证**: mysql2 连接配置中 ssl 选项必须启用
