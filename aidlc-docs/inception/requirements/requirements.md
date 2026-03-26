# Requirements Document — AI Workshop (GitHub Multi-Agent Platform)

## Intent Analysis

- **User Request**: 建设一个围绕 GitHub 的多 Agent 协作平台，自动完成 PR Review、Issue 回复/SPAM 检测/打标、审计日志记录
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: System-wide — 多个功能模块 + 外部集成 + 数据库
- **Complexity Estimate**: Complex — GitHub API 集成、AI 判断逻辑、定时调度、数据库审计、规则引擎

---

## 1. Project Overview

### 1.1 项目目标
围绕 GitHub 系统，建设一个多 Agent 协作平台，自动完成：
- PR 自动 Review
- Issue 自动回复与 SPAM 检测
- Issue 自动打标分类
- 操作审计日志

### 1.2 核心价值
- 降低人工判断和汇总成本
- 提高 Issue 分配和风险提醒准确率
- 把工程数据和用户体验数据打通
- 为团队和管理层提供持续的工程智能

---

## 2. Functional Requirements

### FR-01: PR 自动 Review
- **触发**: 每隔 10 分钟检查目标仓库是否有 open 的 PR
- **行为**:
  - 对每个 open PR 进行自动化 Review
  - 根据 `/rules/pr-review-rules.md` 中定义的规则判断是否有 red flag
  - 如果没有 red flag，直接 approve PR
  - 如果有 red flag，在 PR 中留下评论说明问题
  - 所有评论必须带前缀 `"from AI Workshop: "`
- **工具**: 使用本地 `gh` CLI 命令与 GitHub 交互
- **目标仓库**: 从环境变量 `${REPOSITORY_URL}` 读取

### FR-02: Issue 自动回复与 SPAM 检测
- **触发**: 每隔 10 分钟检查目标仓库所有 open 的 Issue
- **行为**:
  - 每次最多处理 3 条 Issue
  - 结合对目标仓库的理解（README、代码结构、文档等）进行 review
  - 给出上下文相关的评论回复
  - 所有评论必须带前缀 `"from AI Workshop: "`
  - 如果 Issue 被判定为 SPAM（根据 `/rules/spam-detection-rules.md`），直接关闭该 Issue
- **SPAM 判定**: 根据规则文件中定义的标准（广告、无意义内容、恶意链接、与仓库无关等）
- **工具**: 使用本地 `gh` CLI 命令
- **目标仓库**: 从环境变量 `${REPOSITORY_URL}` 读取

### FR-03: Issue 自动打标
- **触发**: 每隔 10 分钟检查目标仓库所有 open 的 Issue
- **行为**:
  - 为每个 Issue 进行分类，根据类型打一个 label
  - 标签分类体系定义在 `/rules/issue-labeling-rules.md`
  - 不重复打标：已打过标的 Issue 添加 `"tagged"` label 表示标记完成
  - 如果 Issue 已有 `"tagged"` label，跳过处理
- **工具**: 使用本地 `gh` CLI 命令
- **目标仓库**: 从环境变量 `${REPOSITORY_URL}` 读取

### FR-04: 安全审计日志
- **行为**:
  - 所有功能（FR-01/02/03）的操作记录必须写入审计数据库
  - 数据库: TiDB Cloud Zero
  - 数据库名: `ai_workshop_audit_db`
  - 表名: `audit_logs`
  - 必要字段:
    - `id` — 主键，自增
    - `operation_time` — 操作时间（ISO 8601）
    - `operation_type` — 操作类型（pr_review / issue_reply / issue_label / spam_close）
    - `operation_log` — 操作详情（JSON 格式，包含具体操作内容）
    - `operator_email` — 操作者邮箱，取自环境变量 `${OPERATOR_EMAIL}`
    - `target_repo` — 目标仓库
    - `target_id` — PR/Issue 编号
  - 每次定时任务运行都必须记录审计日志，包括"无操作"的情况

### FR-05: 规则配置文件
- **位置**: `/rules/*.md`
- **文件**:
  - `pr-review-rules.md` — PR Review 的 red flag 判定规则
  - `spam-detection-rules.md` — Issue SPAM 判定规则
  - `issue-labeling-rules.md` — Issue 标签分类规则
- **格式**: Markdown，便于人工阅读和修改
- **加载**: 服务启动时加载，支持运行时重新加载

---

## 3. Non-Functional Requirements

### NFR-01: 技术栈
- **运行时**: Node.js (TypeScript)
- **调度**: 内置调度器（node-cron 或类似）
- **GitHub 交互**: 本地 `gh` CLI（已登录）
- **数据库**: TiDB Cloud Zero (MySQL 兼容)
- **包管理**: npm/pnpm，使用 lock file

### NFR-02: 性能
- 每次定时任务执行应在 5 分钟内完成（10 分钟间隔内）
- Issue 处理每次最多 3 条，避免 API 限流

### NFR-03: 可靠性
- 定时任务失败不应导致服务崩溃
- 所有外部调用（gh CLI、数据库）必须有错误处理和重试机制
- 全局错误处理器捕获未处理异常

### NFR-04: 安全性
- 不在代码中硬编码任何凭证
- 敏感信息通过环境变量传递
- 数据库连接使用 TLS
- 日志中不记录敏感信息（token、密码等）
- 启用 SECURITY-01 至 SECURITY-15 所有安全规则

### NFR-05: 可维护性
- 规则文件与代码分离，支持独立修改
- 结构化日志（包含 timestamp、level、message）
- 代码遵循 TypeScript 严格模式

### NFR-06: 可观测性
- 结构化日志输出到 stdout
- 每次定时任务执行记录开始/结束时间和处理结果
- 错误日志包含完整上下文

---

## 4. Environment Configuration

| 变量名 | 用途 | 示例 |
|---|---|---|
| `OPERATOR_EMAIL` | 审计日志中的操作者邮箱 | `shengbo.ma@pingcap.com` |
| `REPOSITORY_URL` | 目标 GitHub 仓库 URL | `git@github.com:tidbcloud/dbaas-ui.git` |
| `DATABASE_URL` | TiDB Cloud Zero 连接字符串 | `mysql://...` |

---

## 5. Acceptance Criteria (验收标准)

### AC-01: GitHub Issue SPAM 检测验收
1. 根据对项目的了解，创建 2 个 Issue：一个正常 Issue，一个 SPAM Issue
2. 发起 Issue 自动巡检
3. SPAM Issue: 检查是否被关闭（未评论直接关闭 = 测试通过）
4. 正常 Issue: 检查是否有评论，且评论前缀为 `"from AI Workshop:"`
5. 验证完成后，删除 2 条测试 Issue

### AC-02: PR 自动 Review
- Open PR 被自动 Review
- 无 red flag 的 PR 被 approve
- 评论带有 `"from AI Workshop: "` 前缀

### AC-03: Issue 自动打标
- Open Issue 被自动分类并打上对应 label
- 已打标的 Issue 有 `"tagged"` label
- 不重复打标

### AC-04: 审计日志
- 所有操作记录写入 `ai_workshop_audit_db.audit_logs`
- 记录包含完整的操作信息

---

## 6. Autopilot Delivery Team Integration

本项目使用 Autopilot Delivery Team SKILL 进行多 Agent 协作：
- **Klaus-PM**: 任务简报、里程碑、验收标准
- **Klaus-CTO**: 架构决策、接口契约、设计文档
- **Klaus-Dev**: 代码实现（小而可审查的变更）
- **Klaus-QA**: 测试计划、验收映射、发布门控
- **Klaus-OPS**: 部署/回滚/可观测性/运维手册

---

## 7. Constraints

- GitHub 交互仅通过本地 `gh` CLI，不使用 GitHub API SDK
- 目标仓库固定为环境变量指定的单个仓库
- 数据库使用 TiDB Cloud Zero（MySQL 兼容协议）
- 所有 AI 判断规则可配置，存放在 `/rules/*.md`
