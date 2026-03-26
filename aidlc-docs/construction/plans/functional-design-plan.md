# Functional Design Plan — AI Workshop (All Units)

由于本项目是单体服务，5 个 Unit 紧密耦合，采用统一的 Functional Design 计划。

## Execution Checklist

### Unit 1: Core Infrastructure
- [x] 1.1 App 启动/关闭生命周期逻辑
- [x] 1.2 ConfigService 验证规则
- [x] 1.3 Scheduler 调度逻辑和容错

### Unit 2: GitHub Integration
- [x] 2.1 gh CLI 命令封装和输出解析
- [x] 2.2 重试和超时策略
- [x] 2.3 数据类型定义（PR, Issue, RepoContext）

### Unit 3: Rule Engine
- [x] 3.1 Markdown 规则文件解析逻辑
- [x] 3.2 PR Review 规则结构
- [x] 3.3 SPAM 检测规则结构
- [x] 3.4 Issue 标签规则结构
- [x] 3.5 规则缓存和重新加载

### Unit 4: Agents (Business Logic)
- [x] 4.1 PRReviewAgent 业务流程
- [x] 4.2 IssueReplyAgent 业务流程（含 SPAM 检测）
- [x] 4.3 IssueLabelAgent 业务流程（含防重复打标）

### Unit 5: Audit & Persistence
- [x] 5.1 数据库表结构（DDL）
- [x] 5.2 审计日志写入逻辑
- [x] 5.3 连接池管理

---

## Clarification Questions

无需额外澄清 — 需求文档、用户故事和应用设计已提供足够的业务逻辑上下文。

---
